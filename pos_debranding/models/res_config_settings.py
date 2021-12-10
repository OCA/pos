from odoo import api, fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_debranding_title = fields.Char(
        "POS Debranding Title",
        config_parameter="pos_debranding_title",
        default="My Title"
    )

    @api.model
    def get_pos_debranding_values(self):
        pos_debranding_title = (
            self.env["ir.config_parameter"].sudo().get_param("pos_debranding_title")
        )
        return {
            "pos_debranding_title": pos_debranding_title,
        }
