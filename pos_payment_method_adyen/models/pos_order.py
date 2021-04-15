# Copyright 2018-21 ForgeFlow S.L. (https://www.forgeflow.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, models, fields


class PosOrder(models.Model):
    _inherit = "pos.order"

    customer_card_alias = fields.Char("Card Alias")
    customer_card_country_code = fields.Char("Country Code of card issuer")
    customer_card_country_iso = fields.Char("ISO Country Code of card issuer")
    customer_card_funding_source = fields.Char("Funding Source")

    @api.model
    def _order_fields(self, ui_order):
        res = super()._order_fields(ui_order)
        res.update({
            "customer_card_alias": ui_order.get("customer_card_alias", False),
            "customer_card_country_code": ui_order.get("customer_card_country_code", False),
            "customer_card_country_iso": ui_order.get("customer_card_country_iso", False),
            "customer_card_funding_source": ui_order.get("customer_card_funding_source", False),
        })
        return res
