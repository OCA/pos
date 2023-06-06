# © 2023 FactorLibre - Juan Carlos Bonilla <juancarlos.bonilla@factorlibre.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    hide_fiscal_position_button = fields.Boolean(
        "Hide fiscal position button", default=True
    )
