# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class AccountMove(models.Model):
    _name = "account.move"
    _inherit = "account.move"

    splitting_partner_ref = fields.Char(
        related="splitting_partner_id.ref", string="Splitting Partner Ref"
    )
