# Copyright 2023 Jose Zambudio - Aures Tic <jose@aurestic.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    return_voucher_validity = fields.Integer(
        default=30,
        help="If you leave this option empty, the vouchers will have an "
        "indefinite date, i.e., they will never expire.",
    )
