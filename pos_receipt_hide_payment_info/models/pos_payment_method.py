# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    hide_payment_info_in_receipt = fields.Boolean(
        string="Hide payment informations from receipt"
    )
