# © 2022 FactorLibre - Alvaro Rollan <alvaro.rollan@factorlibre.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_default_partner_id = fields.Many2one(
        related="pos_config_id.default_partner_id",
        readonly=False,
    )
