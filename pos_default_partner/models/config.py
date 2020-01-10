# copyright 2020 Akretion David BEAL
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_default_partner_id = fields.Many2one(
        comodel_name="res.partner", readonly=False,
        related="company_id.pos_default_partner_id")
