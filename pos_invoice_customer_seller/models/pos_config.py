# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    set_seller_invoice = fields.Boolean(
        string="Use Customer Seller in Invoices",
        help="Check this in order to use the customer seller (if defined) in invoices"
        " instead of the POS Cashier.",
    )
