# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    pos_order_zipcode_zip_required = fields.Boolean(
        string="Catchment area info required",
        help="When checked Zip code is required to validate payment and print ticket.",
        default=True,
    )
