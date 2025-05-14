from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    module_pos_product_info_location = fields.Boolean(
        string="Module Pos Product Info Location Installed",
        compute="_compute_module_pos_product_info_location",
    )

    @api.depends("company_id")
    def _compute_module_pos_product_info_location(self):
        is_installed = bool(
            self.env["ir.module.module"]
            .sudo()
            .search_count(
                [
                    ("name", "=", "pos_product_info_location"),
                    ("state", "=", "installed"),
                ]
            )
        )
        for config in self:
            config.module_pos_product_info_location = is_installed
