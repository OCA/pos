from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    module_pos_product_info_position = fields.Boolean(
        string="Module Pos Product Info Position Installed",
        compute="_compute_module_pos_product_info_position",
    )

    @api.depends("company_id")
    def _compute_module_pos_product_info_position(self):
        is_installed = bool(
            self.env["ir.module.module"]
            .sudo()
            .search_count(
                [
                    ("name", "=", "pos_product_info_position"),
                    ("state", "=", "installed"),
                ]
            )
        )
        for config in self:
            config.module_pos_product_info_position = is_installed
