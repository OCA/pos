# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    hide_payment_info_in_receipt = fields.Boolean(
        related="payment_method_id.hide_payment_info_in_receipt"
    )
