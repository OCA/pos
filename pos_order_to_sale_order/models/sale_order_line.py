# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    @api.model
    def _prepare_from_pos(self, sale_order, order_line_data):
        ProductProduct = self.env["product.product"]
        product = ProductProduct.browse(order_line_data["product_id"])
        return {
            "order_id": sale_order.id,
            "product_id": order_line_data["product_id"],
            "name": product.name,
            "product_uom_qty": order_line_data["qty"],
            "discount": order_line_data["discount"],
            "price_unit": order_line_data["price_unit"],
            "tax_id": order_line_data["tax_ids"],
        }
