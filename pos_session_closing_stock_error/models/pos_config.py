from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    allow_session_closing_with_stock_errors = fields.Boolean(
        string="Allow closing sessions with stock errors",
        help="If disabled, closing a session that has stock errors "
             "will be blocked.",
    )
