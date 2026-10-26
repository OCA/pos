# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import json
from functools import partial

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def _order_fields(self, ui_order):
        res = super()._order_fields(ui_order)
        if not ui_order.get("lines"):
            return res

        process_line = partial(
            self.env["pos.order.line"]._order_line_fields,
            session_id=ui_order["pos_session_id"],
        )
        expanded_lines = []
        for ui_line in ui_order["lines"]:
            line_data = dict(ui_line[2]) if len(ui_line) > 2 and ui_line[2] else {}
            combo_prod_info = line_data.get("combo_prod_info") or []
            if combo_prod_info:
                line_data["combo_subline_json"] = json.dumps(combo_prod_info)
            processed_main_line = process_line([ui_line[0], ui_line[1], line_data])
            expanded_lines.append(processed_main_line)

            if combo_prod_info:
                parent_qty = float(line_data.get("qty", 1.0) or 1.0)
                for sub_item in combo_prod_info:
                    sub_product_id = sub_item.get("product_id")
                    if not sub_product_id:
                        continue
                    sub_product = self.env["product.product"].browse(sub_product_id)
                    if not sub_product.exists():
                        continue
                    sub_qty = parent_qty * float(sub_item.get("qty", 1.0) or 1.0)
                    sub_line_vals = {
                        "product_id": sub_product.id,
                        "full_product_name": sub_product.display_name,
                        "qty": sub_qty,
                        "price_unit": 0.0,
                        "price_subtotal": 0.0,
                        "price_subtotal_incl": 0.0,
                        "discount": 0.0,
                        "tax_ids": [(6, 0, [])],
                        "is_combo_subline": True,
                    }
                    expanded_lines.append(process_line([0, 0, sub_line_vals]))

        res["lines"] = expanded_lines
        return res

    def _prepare_invoice_line(self, order_line):
        vals = super()._prepare_invoice_line(order_line)
        vals.update(
            {
                "is_combo_subline": order_line.is_combo_subline,
                "combo_subline_json": order_line.combo_subline_json,
            }
        )
        return vals


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    is_combo_subline = fields.Boolean(
        string="Is Combo Sub-Product Line",
        default=False,
    )
    combo_subline_json = fields.Text(
        string="Combo Sub-Products JSON",
    )

    def _export_for_ui(self, orderline):
        res = super()._export_for_ui(orderline)
        res["is_combo_subline"] = orderline.is_combo_subline
        if orderline.combo_subline_json:
            try:
                res["combo_prod_info"] = json.loads(orderline.combo_subline_json)
            except ValueError:
                res["combo_prod_info"] = []
        else:
            res["combo_prod_info"] = []
        return res
