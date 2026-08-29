import json

from odoo import fields, models
from odoo.tools import format_date, safe_eval


class PosOrderReportWizard(models.TransientModel):
    _name = "pos.order.report.wizard"
    _description = "POS Order Pivot Export Wizard"

    horizontal_axis_id = fields.Many2one(
        "ir.model.fields",
        string="Horizontal Axis (Group By)",
        domain=[
            ("model", "=", "report.pos.order"),
            ("store", "=", True),
            (
                "ttype",
                "in",
                ["many2one", "selection", "char", "boolean", "date", "datetime"],
            ),
        ],
    )
    vertical_axis_id = fields.Many2one(
        "ir.model.fields",
        string="Vertical Axis (Group By)",
        domain=[
            ("model", "=", "report.pos.order"),
            ("store", "=", True),
            (
                "ttype",
                "in",
                ["many2one", "selection", "char", "boolean", "date", "datetime"],
            ),
        ],
    )
    measure_ids = fields.Many2many(
        "ir.model.fields",
        string="Measures",
        default=lambda self: self.get_default_measure(),
        domain=[
            ("model", "=", "report.pos.order"),
            ("store", "=", True),
            ("ttype", "in", ["integer", "float", "monetary"]),
            ("name", "!=", "id"),
        ],
    )
    domain = fields.Char(
        string="Domain (in JSON)",
        help="Optional domain in JSON format, e.g. [['state','=','paid']]",
    )
    output_file = fields.Binary()

    def get_default_measure(self, force=False):
        args = [("model", "=", "report.pos.order"), ("store", "=", True)]
        if force:
            args.append(("name", "=", "order_id"))
        else:
            args.append(("name", "in", ("order_id", "price_subtotal_excl")))
        field_names = self.env["ir.model.fields"].search(args)
        return field_names

    def _get_eval_context(self):
        return {
            "datetime": safe_eval.datetime,
            "dateutil": safe_eval.dateutil,
            "time": safe_eval.time,
            "uid": self.env.uid,
            "user": self.env.user,
        }

    def prepared_data(self, raw_datas):  # noqa: C901
        """Prepare data for pivot export"""
        self.ensure_one()
        model_name = "report.pos.order"
        Model = self.env[model_name]

        # --- Fetch field metadata
        field_recs = (
            self.env["ir.model.fields"].sudo().search([("model", "=", model_name)])
        )
        model_fields = {f.name: f for f in field_recs}

        # --- Prepare type + selection maps
        field_selection_map = {}
        field_types = {}
        for field_name, field_def in Model._fields.items():
            field_types[field_name] = field_def.type
            if field_def.type == "selection":
                field_selection_map[field_name] = dict(field_def.selection)

        # User info
        user = self.env.user
        user_lang = self.env["res.lang"].search([("code", "=", user.lang)], limit=1)
        date_format = user_lang.date_format or "%Y-%m-%d"
        time_format = getattr(user_lang, "time_format", "%H:%M:%S")
        user_tz = user.tz or "UTC"

        def get_label(field_name):
            fld = model_fields.get(field_name)
            return self.env._(fld.field_description) if fld else self.env._(field_name)

        def format_value(field_name, value):
            if value is None:
                return ""
            ftype = field_types.get(field_name)

            # Many2one
            if isinstance(value, tuple):
                return value[1]

            # Selection
            if field_name in field_selection_map:
                # Note: Odoo selection labels are already translated
                return field_selection_map[field_name].get(value, value)

            # Date
            if ftype == "date":
                try:
                    if isinstance(value, str):
                        value = fields.Date.from_string(value)
                    return format_date(self.env, value, lang_code=user.lang)
                except Exception:
                    return str(value)

            # Datetime
            if ftype == "datetime":
                try:
                    if isinstance(value, str):
                        value = fields.Datetime.from_string(value)
                    local_dt = fields.Datetime.context_timestamp(
                        self.with_context(tz=user_tz), value
                    )
                    return local_dt.strftime(f"{date_format} {time_format}")
                except Exception:
                    return str(value)

            return value

        start_id = inc_id = 195
        datas = {
            "headers": [
                [
                    {
                        "width": 0,
                        "height": 1,
                        "title": self.env._("Total"),
                        "id": start_id,
                        "expanded": True,
                    },
                ],
            ],
            "measure_row": [],
            "rows": [],
            "nbr_measures": len(self.measure_ids) or 1,
        }
        headers = datas["headers"]
        measure_row = datas["measure_row"]
        rows = datas["rows"]
        col_ids = []
        if self.measure_ids:
            headers[0].append(
                {"width": len(self.measure_ids), "height": 2, "title": ""}
            )

        # header
        horizontal_names = []
        title_datas = []
        if self.horizontal_axis_id:
            headers.append([])
            field_name = self.horizontal_axis_id.name
            for raw_data in raw_datas:
                horizontal_name = raw_data.get(field_name)
                if horizontal_name in horizontal_names:
                    continue
                horizontal_names.append(horizontal_name)
                inc_id += 1
                col_ids.append(inc_id)
                header_val = {
                    "width": datas["nbr_measures"],
                    "height": 1,
                    "title": str(format_value(field_name, horizontal_name)),
                    "id": inc_id,
                    "expanded": False,
                }
                headers[1].append(header_val)
                # measure_row
                mrows = []
                for measure in self.measure_ids:
                    mrows.append(
                        {
                            "title": get_label(measure.name),
                            "is_bold": False,
                            "id": inc_id,
                            "field_name": measure.name,
                        }
                    )
                if not mrows:
                    mrows.append({})
                measure_row += mrows
            title_datas = headers[1]
        mrows = []
        for measure in self.measure_ids:
            mrows.append(
                {
                    "title": get_label(measure.name),
                    "is_bold": True,
                    "id": start_id,
                    "field_name": measure.name,
                }
            )
        measure_row += mrows
        headers[0][0]["width"] = len(measure_row) - datas["nbr_measures"]

        # rows
        col_ids.append(start_id)
        vertical_names = []
        row_datas = {}  # {vertial_name: {horizontal_name: {measure_name: val}}}
        field_name = self.vertical_axis_id.name
        for raw_data in raw_datas:
            vertical_name = raw_data.get(field_name)
            if vertical_name and vertical_name not in vertical_names:
                vertical_names.append(vertical_name)
        for vertical_name in vertical_names:
            raw_data_vertical = []
            for raw_data in raw_datas:
                if raw_data.get(self.vertical_axis_id.name) == vertical_name:
                    raw_data_vertical.append(raw_data)
            row_datas = self.generate_row(
                raw_data_vertical, title_datas, measure_row, format_value
            )
            inc_id += 1
            rows.append(
                {
                    "id": inc_id,
                    "col_ids": col_ids,
                    "indent": 1,
                    "title": str(format_value(field_name, vertical_name)),
                    "expanded": False,
                    "values": row_datas,
                }
            )
        # Total row
        total_datas = []
        if rows:
            for mrow in measure_row:
                idx = measure_row.index(mrow)
                total_val = 0.0
                for r in rows:
                    if idx < len(r["values"]):
                        total_val += r["values"][idx].get("value")
                total_datas.append({"is_bold": True, "value": total_val})
        else:
            total_datas = self.generate_row(
                raw_datas, title_datas, measure_row, format_value
            )
        rows.insert(
            0,
            {
                "id": start_id - 1,
                "col_ids": col_ids,
                "indent": 0,
                "title": self.env._("Total"),
                "expanded": True,
                "values": total_datas,
            },
        )
        return datas

    def generate_row(self, raw_datas, title_datas, measure_row, format_value):
        row_datas = []
        for mrow in measure_row[0 : -len(self.measure_ids)]:
            mrow_datas = {"is_bold": False, "value": 0}
            title = self.get_title(title_datas, mrow.get("id"))
            for raw_data in raw_datas:
                horizontal_name = str(
                    format_value(
                        self.horizontal_axis_id.name,
                        raw_data.get(self.horizontal_axis_id.name),
                    )
                )
                if horizontal_name != title:
                    continue
                mrow_datas["value"] = raw_data.get(mrow.get("field_name"), 0)
            row_datas.append(mrow_datas)
        total_dict = {}
        for raw_data in raw_datas:
            for measure in self.measure_ids:
                if measure.name not in total_dict:
                    total_dict[measure.name] = 0
                total_dict[measure.name] += raw_data.get(measure.name)
        for measure in self.measure_ids:
            row_datas.append({"is_bold": True, "value": total_dict.get(measure.name)})
        return row_datas

    def get_title(self, datas, _id):
        for d in datas:
            if d.get("id") == _id:
                return d.get("title")
        return None

    def action_export_xlsx(self):
        self.ensure_one()
        domain = (
            self.domain
            and safe_eval.safe_eval(self.domain, self._get_eval_context())
            or []
        )
        model_name = "report.pos.order"
        Model = self.env[model_name]

        # --- Prepare groupbys and measures
        groupbys = []
        if self.vertical_axis_id:
            groupbys.append(self.vertical_axis_id.name)
        if self.horizontal_axis_id:
            groupbys.append(self.horizontal_axis_id.name)

        measures = [f.name for f in self.measure_ids]

        # Identify non-summable fields → replace with count
        valid_sum_types = ("integer", "float", "monetary")
        computed_measures = []
        measures = []
        measure_labels = {}
        for m in self.measure_ids:
            field_type = m.ttype
            measure_name = f"{m.name}:sum"
            if field_type not in valid_sum_types:
                # Non-numeric → use count instead
                measure_name = f"{m.name}:count_distinct"
            computed_measures.append(m.name)
            measure_labels[m.name] = self.env._(m.field_description)
            measures.append(measure_name)

        # --- Read data
        results = Model.read_group(domain, measures, groupbys, lazy=False)
        datas = self.prepared_data(results)
        jdata = {
            "title": self.env._("Point of Sale Analysis"),
            "model": model_name,
            "col_group_headers": datas.get("headers", []),
            "measure_headers": datas.get("measure_row", []),
            "origin_headers": [],
            "rows": datas.get("rows", []),
            "measure_count": datas.get("nbr_measures", 0),
            "origin_count": 1,
        }

        base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
        url = f"{base_url}/web/pivot/export_xlsx?data={json.dumps(jdata)}"

        return {
            "type": "ir.actions.act_url",
            "url": url,
            "target": "new",
        }
