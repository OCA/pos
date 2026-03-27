# Copyright (C) 2026-Today GRAP (https://www.grap.coop)
# @author Quentin DUPONT
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    origin_order_uid = fields.Char(
        string="Original Order",
        help="This order was originally from this order before being split during payment",
    )

    # Overload Section
    @api.model
    def _order_fields(self, ui_order):
        res = super()._order_fields(ui_order)
        res["origin_order_uid"] = ui_order.get("origin_order_uid") or False
        return res

    @api.model
    def get_split_order_linked_order_lines(self, origin_order_uid, pos_session_id):
        orders = self.search([("origin_order_uid", "=", origin_order_uid)])
        lines = orders.mapped("lines")

        res_lines = []
        for line in lines:
            res_lines.append(
                {
                    "id": line.id,
                    "order_name": line.order_id.name,
                    "date_order": line.order_id.date_order,
                    "product_name": line.product_id.display_name,
                    "product_qty": line.qty,
                    "product_uom_name": line.product_uom_id.name,
                    "discount": line.discount,
                    "price_unit": line.price_unit,
                    "price_subtotal": line.price_subtotal,
                }
            )

        return res_lines
