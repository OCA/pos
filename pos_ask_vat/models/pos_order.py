# Copyright 2022 KMEE - Gabriel Cardoso <gabriel.cardoso@kmee.com.br>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrder(models.Model):

    _inherit = "pos.order"

    customer_tax_id = fields.Char(
        string="Customer Tax ID",
        readonly=True,
        copy=False,
    )

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res["customer_tax_id"] = ui_order.get("customer_tax_id")
        return res

    @api.onchange("partner_id")
    def _onchange_partner_id(self):
        if self.partner_id:
            self.customer_tax_id = self.partner_id.vat
        else:
            self.customer_tax_id = False
