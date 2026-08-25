# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _prepare_invoice_vals(self):
        invoice_vals = super()._prepare_invoice_vals()
        if self.config_id.set_seller_invoice and self.partner_id.user_id:
            invoice_vals["invoice_user_id"] = self.partner_id.user_id.id
        return invoice_vals
