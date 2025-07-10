from odoo import fields, models


class PosSession(models.Model):
    _inherit = "pos.session"

    require_customer = fields.Selection(
        related="config_id.require_customer",
    )
