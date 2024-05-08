# Copyright 2023 Jose Zambudio - Aures Tic <jose@aurestic.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    return_voucher = fields.Boolean()
