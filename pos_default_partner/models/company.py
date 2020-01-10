# copyright 2020 Akretion David BEAL
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    pos_default_partner_id = fields.Many2one(
        comodel_name="res.partner", string="Default customer")
