# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    # Columns Section
    margin = fields.Float(
        "Margin",
        compute="_compute_multi_margin",
        store=True,
        digits="Product Price",
    )

    purchase_price = fields.Float(
        "Cost Price",
        compute="_compute_multi_margin",
        store=True,
        digits="Product Price",
    )

    # Compute Section
    @api.depends("product_id", "qty", "price_subtotal")
    def _compute_multi_margin(self):
        for line in self.filtered("product_id"):
            purchase_price = self._get_purchase_price(line)
            line.purchase_price = purchase_price
            if purchase_price:
                line.margin = line.price_subtotal - (purchase_price * line.qty)

    @api.model
    def _get_purchase_price(self, line):
        """Overwrite the method from the module "sale_margin"
        (https://github.com/odoo/odoo/blob/14.0/addons/sale_margin/models/sale_order.py#L20)"""
        if not line.product_id:
            line.purchase_price = 0.0
        line = line.with_company(line.company_id)
        product = line.product_id
        product_cost = product.standard_price
        if not product_cost:
            line.purchase_price = 0.0
        fro_cur = product.cost_currency_id
        to_cur = line.currency_id or line.order_id.currency_id
        if line.product_uom_id and line.product_uom_id != product.uom_id:
            product_cost = product.uom_id._compute_price(
                product_cost,
                line.product_uom,
            )
        purchase_price = (
            fro_cur._convert(
                from_amount=product_cost,
                to_currency=to_cur,
                company=line.company_id or self.env.company,
                date=line.order_id.date_order or fields.Date.today(),
                round=False,
            )
            if to_cur and product_cost
            else product_cost
        )
        return purchase_price
