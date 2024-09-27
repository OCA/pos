# Copyright 2023 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models


class ProductPricelist(models.Model):
    _inherit = "product.pricelist"

    split_invoice_partner_id = fields.Many2one(
        "res.partner",
        tracking=True,
    )


class ProductPricelistItem(models.Model):
    _inherit = "product.pricelist.item"

    split_invoice_partner_id = fields.Many2one(
        "res.partner", related="pricelist_id.split_invoice_partner_id", readonly=True
    )
    compute_price = fields.Selection(
        selection_add=[("split", "Split Invoice")], ondelete={"split": "set default"}
    )
    split_percentage = fields.Float(help="Percentage payed by the splitting partner")
    split_base = fields.Selection(
        selection=[
            ("list_price", "Sales Price"),
            ("standard_price", "Cost"),
            ("pricelist", "Other Pricelist"),
        ],
        string="Split amount Based on",
        default="list_price",
        required=True,
        help="Base price for computation.\n"
        "Sales Price: The base price will be the Sales Price.\n"
        "Cost Price: The base price will be the cost price.\n"
        "Other Pricelist: Computation of the base price based on another Pricelist.",
    )
    split_base_pricelist_id = fields.Many2one(
        "product.pricelist", "Other Pricelist", check_company=True
    )

    @api.depends("split_base", "split_percentage", "split_base_pricelist_id")
    def _compute_rule_tip(self):
        super()._compute_rule_tip()
        base_selection_vals = {
            elem[0]: elem[1]
            for elem in self._fields["base"]._description_selection(self.env)
        }
        split_base_selection_vals = {
            elem[0]: elem[1]
            for elem in self._fields["split_base"]._description_selection(self.env)
        }
        for item in self.filtered(lambda r: r.compute_price == "split"):
            item.rule_tip = _(
                "%(base)s paying %(split_percentage)s %% of %(split_base)s by splitting partner",
                base=base_selection_vals[item.base],
                split_percentage=item.split_percentage,
                split_base=split_base_selection_vals[item.split_base],
            )

    def _compute_base_price(self, product, quantity, uom, date, currency):
        result = super()._compute_base_price(product, quantity, uom, date, currency)
        if self.compute_price == "split" and not self.env.context.get(
            "pos_get_total_price"
        ):
            return result - self._compute_split_price(
                product, quantity, uom, date, currency
            )
        return result

    def _compute_split_price(self, product, quantity, uom, date, currency):
        if self.compute_price != "split":
            return 0.0
        rule_base = self.split_base or "list_price"
        if rule_base == "pricelist" and self.split_base_pricelist_id:
            price = self.split_base_pricelist_id._get_product_price(
                product,
                quantity,
                currency=self.base_pricelist_id.currency_id,
                uom=uom,
                date=date,
            )
            src_currency = self.split_base_pricelist_id.currency_id
        elif rule_base == "standard_price":
            src_currency = product.cost_currency_id
            price = product._price_compute(rule_base, uom=uom, date=date)[product.id]
        else:  # list_price
            src_currency = product.currency_id
            price = product._price_compute(rule_base, uom=uom, date=date)[product.id]

        if src_currency != currency:
            price = src_currency._convert(
                price, currency, self.env.company, date, round=False
            )
        return currency.round(price * self.split_percentage / 100)
