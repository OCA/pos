# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    @api.model
    def _prepare_from_pos(self, order_line_data):
        vals = {
            "product_id": order_line_data["product_id"],
            "product_uom_qty": order_line_data["qty"],
            "discount": order_line_data["discount"],
            "price_unit": order_line_data["price_unit"],
            "tax_id": order_line_data["tax_ids"],
        }
        if (
            order_line_data.get("customer_note")
            and self.env["ir.config_parameter"]
            .sudo()
            .get_param("pos_order_to_sale_order.sol_name_mode", "product_pos")
            == "product_pos"
        ):
            product = self.env["product.product"].browse(order_line_data["product_id"])
            product_name = product.name
            product_name += "\n" + order_line_data["customer_note"]
            vals.update(name=product_name)
        return vals
