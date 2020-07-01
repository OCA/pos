from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'
    assigned_user_ids = fields.Many2many(
        "res.users", string="Assigned users",
        help="Restrict some users to only access their assigned points of sale. "
             "In order to apply the restriction, the user needs the "
             "'User: Assigned POS Only' group")
