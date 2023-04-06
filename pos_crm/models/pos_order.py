# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrder(models.Model):

    _inherit = "pos.order"

    partner_vat = fields.Char(
        string="Partner VAT",
        readonly=True,
        copy=False,
    )

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res["partner_vat"] = ui_order["partner_vat"]
        return res

    @api.onchange("partner_id")
    def _onchange_partner_id(self):
        if self.partner_id:
            self.partner_vat = self.partner_id.vat
        else:
            self.partner_vat = False
