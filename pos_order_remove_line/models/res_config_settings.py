from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_line_remove_btn = fields.Boolean(
        related="pos_config_id.pos_line_remove_btn",
        readonly=False,
    )
    pos_line_remove_warning = fields.Boolean(
        related="pos_config_id.pos_line_remove_warning",
        readonly=False,
    )
