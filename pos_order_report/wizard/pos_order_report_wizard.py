

import datetime
import time
import dateutil
import base64
from io import BytesIO
from collections import deque
from odoo import fields, models, _
from odoo.tools import safe_eval, ustr
from odoo.tools.misc import xlwt
from odoo.tools.func import lazy
from odoo.exceptions import UserError
import logging

_logger = logging.getLogger(__name__)


class PosOrderReportWizard(models.TransientModel):
    _name = "pos.order.report.wizard"
    _description = "Pos Order Report Wizard"

    horizontal_axis_id = fields.Many2one(
        comodel_name="ir.model.fields",
        required=True,
        domain="[('model', '=', 'report.pos.order'), ('store', '=', True), "
            "('ttype', 'not in', ('float', 'integer'))]"
    )
    vertical_axis_id = fields.Many2one(
        comodel_name="ir.model.fields",
        required=True,
        domain="[('model', '=', 'report.pos.order'), ('store', '=', True), "
            "('ttype', 'not in', ('float', 'integer'))]",
    )
    measure_ids = fields.Many2many(
        comodel_name="ir.model.fields",
        relation="pos_orw_field_ms_rel",
        required=True,
        default=lambda self: self.get_default_measure(),
        domain="[('model', '=', 'report.pos.order'), ('store', '=', True), "
                "('name', '!=', 'id'), '|', ('ttype', 'in', ('float', 'integer')), ('name', '=', 'order_id')]"
    )
    domain = fields.Char(string="Filters")
    output_file = fields.Binary()

    def _get_eval_context(self):
        return {
            'datetime': datetime,
            'dateutil': dateutil,
            'time': time,
            'uid': self.env.uid,
            'user': self.env.user,
        }

    def prepared_data(self, raw_datas):
        start_id = inc_id = 195
        datas = {
            "headers": [
                [
                    {
                        "width": 0,
                        "height": 1,
                        "title": _("Total"),
                        "id": start_id,
                        "expanded": True
                    },
                ],
            ],
            "measure_row": [],
            "rows": [],
            "nbr_measures": len(self.measure_ids) or 1,
            "title": _("Point of Sale Analysis")
        }
        headers = datas["headers"]
        measure_row = datas["measure_row"]
        rows = datas["rows"]
        col_ids = []
        if self.measure_ids:
            headers[0].append({
                "width": len(self.measure_ids),
                "height": 2,
                "title": ""
            })

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
                horizontal_title = horizontal_name
                if isinstance(horizontal_name, tuple) and len(horizontal_name) == 2:
                    if isinstance(horizontal_name[1], lazy):
                        horizontal_title = horizontal_name[1]._value
                header_val = {
                    "width": datas["nbr_measures"],
                    "height": 1,
                    "title": horizontal_title,
                    "id": inc_id,
                    "expanded": False
                }
                headers[1].append(header_val)
                # measure_row
                mrows = []
                for measure in self.measure_ids:
                    mrows.append({
                        "measure": measure.field_description,
                        "is_bold": False,
                        "id": inc_id,
                        "field_name": measure.name
                    })
                if not mrows:
                    mrows.append({

                    })
                measure_row += mrows
            title_datas = headers[1]
        mrows = []
        for measure in self.measure_ids:
            mrows.append({
                "measure": measure.field_description,
                "is_bold": True,
                "id": start_id,
                "field_name": measure.name
            })
        measure_row += mrows
        headers[0][0]["width"] = len(measure_row) - datas["nbr_measures"]

        # rows
        col_ids.append(start_id)
        vertical_names = []
        row_datas = {}  #{vertial_name: {horizontal_name: {measure_name: val}}}
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
                raw_data_vertical,
                title_datas,
                measure_row
            )
            inc_id += 1
            vertical_title = vertical_name
            if isinstance(vertical_name, tuple) and len(vertical_name) == 2:
                if isinstance(vertical_name[1], lazy):
                    vertical_title = vertical_name[1]._value
            rows.append({
                "id": inc_id,
                "col_ids": col_ids,
                "indent": 1,
                "title": vertical_title,
                "expanded":	False,
                "values": row_datas
            })
        # Total row
        total_datas = []
        if rows:
            for mrow in measure_row:
                idx = measure_row.index(mrow)
                total_val = 0.0
                for r in rows:
                    if idx < len(r["values"]):
                        total_val += r["values"][idx].get("value")
                total_datas.append({
                    "is_bold": True,
                    "value": total_val
                })
        else:
            total_datas = self.generate_row(
                raw_datas,
                title_datas,
                measure_row
            )
        rows.insert(0, {
            "id": start_id - 1,
            "col_ids": col_ids,
            "indent": 0,
            "title": _("Total"),
            "expanded":	True,
            "values": total_datas
        })
        return datas

    def generate_row(self, raw_datas, title_datas, measure_row):
        row_datas = []
        for mrow in measure_row[0:-len(self.measure_ids)]:
            mrow_datas = {
                "is_bold": False,
                "value": 0
            }
            title = self.get_title(title_datas, mrow.get("id"))
            for raw_data in raw_datas:
                horizontal_name = raw_data.get(
                    self.horizontal_axis_id.name)
                if isinstance(horizontal_name, tuple) and len(horizontal_name) == 2:
                    if isinstance(horizontal_name[1], lazy):
                        horizontal_name = horizontal_name[1]._value
                    else:
                        horizontal_name = horizontal_name[1]
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
            row_datas.append({
                "is_bold": True,
                "value": total_dict.get(measure.name)
            })
        return row_datas

    def get_title(self, datas, _id):
        for d in datas:
            if d.get("id") == _id:
                return d.get("title")
        return None

    def export_xls(self, jdata):
        nbr_measures = jdata['nbr_measures']
        workbook = xlwt.Workbook()
        worksheet = workbook.add_sheet(jdata['title'])
        header_bold = xlwt.easyxf("font: bold on; pattern: pattern solid, fore_colour gray25;")
        header_plain = xlwt.easyxf("pattern: pattern solid, fore_colour gray25;")
        bold = xlwt.easyxf("font: bold on;")

        # Step 1: writing headers
        headers = jdata['headers']

        # x,y: current coordinates
        # carry: queue containing cell information when a cell has a >= 2 height
        #      and the drawing code needs to add empty cells below
        x, y, carry = 1, 0, deque()
        for i, header_row in enumerate(headers):
            worksheet.write(i, 0, '', header_plain)
            for header in header_row:
                while (carry and carry[0]['x'] == x):
                    cell = carry.popleft()
                    for i in range(nbr_measures):
                        worksheet.write(y, x+i, '', header_plain)
                    if cell['height'] > 1:
                        carry.append({'x': x, 'height': cell['height'] - 1})
                    x = x + nbr_measures
                style = header_plain if 'expanded' in header else header_bold
                for i in range(header['width']):
                    worksheet.write(y, x + i, header['title'] if i == 0 else '', style)
                if header['height'] > 1:
                    carry.append({'x': x, 'height': header['height'] - 1})
                x = x + header['width']
            while (carry and carry[0]['x'] == x):
                cell = carry.popleft()
                for i in range(nbr_measures):
                    worksheet.write(y, x+i, '', header_plain)
                if cell['height'] > 1:
                    carry.append({'x': x, 'height': cell['height'] - 1})
                x = x + nbr_measures
            x, y = 1, y + 1

        # Step 2: measure row
        if nbr_measures > 1:
            worksheet.write(y, 0, '', header_plain)
            for measure in jdata['measure_row']:
                style = header_bold if measure['is_bold'] else header_plain
                worksheet.write(y, x, measure['measure'], style)
                x = x + 1
            y = y + 1

        # Step 3: writing data
        x = 0
        for row in jdata['rows']:
            worksheet.write(y, x, row['indent'] * '     ' + ustr(row['title']), header_plain)
            for cell in row['values']:
                x = x + 1
                if cell.get('is_bold', False):
                    worksheet.write(y, x, cell['value'], bold)
                else:
                    worksheet.write(y, x, cell['value'])
            x, y = 0, y + 1
        content = BytesIO()
        workbook.save(content)
        content.seek(0)  # Set index to 0, and start reading
        out_file = base64.encodestring(content.read())
        return out_file

    def get_default_measure(self, force=False):
        args = [
            ('model', '=', 'report.pos.order'),
            ('store', '=', True)
        ]
        if force:
            args.append(
                ('name', '=', 'order_id')
            )
        else:
            args.append(
                ('name', 'in', ('order_id', 'price_wo_tax'))
            )
        field_names = self.env["ir.model.fields"].search(args)
        return field_names

    def export_report(self):
        self.ensure_one()
        if not self.measure_ids:
            self.measure_ids = self.get_default_measure(True)
        args = self.domain and safe_eval(
            self.domain, self._get_eval_context()
        ) or []
        groupby = []
        if self.horizontal_axis_id:
            groupby.append(self.horizontal_axis_id.name)
            if self.horizontal_axis_id in self.measure_ids:
                self.measure_ids -= self.horizontal_axis_id
        if self.vertical_axis_id:
            groupby.append(self.vertical_axis_id.name)
            if self.vertical_axis_id in self.measure_ids:
                self.measure_ids -= self.vertical_axis_id
        field_list = []
        for m in self.measure_ids:
            val = m.name
            if val == "order_id":
                val = "order_id:count_distinct"
            field_list.append(val)
        if not field_list:
            pass
            #field_list = ["order_id:count_distinct"]
        raw_data = self.env["report.pos.order"].read_group(
            args, field_list, groupby, lazy=False
        )
        datas = self.prepared_data(raw_data)
        try:
            self.output_file = self.export_xls(datas)
        except Exception as e:
            _logger.error(
                "Error when exporting the excel file: %s",
                str(e),
            )
            raise UserError(_(
                "There are too many values for the Horizontal Axis which "
                "cause the number of column over the limit (256), "
                "please use Vertical Axis instead."))
        url = "{}/web/content/{}/{}/{}/{}?download=true".format(
            self.env['ir.config_parameter'].sudo().get_param('web.base.url'),
            self._name,
            self.id,
            "output_file",
            "table.xls",
        )
        return {
            'type' : 'ir.actions.act_url',
            'url': url,
            'target': 'new',
        }
