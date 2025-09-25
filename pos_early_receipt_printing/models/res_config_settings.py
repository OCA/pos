# Copyright 2025 Ángel García de la Chica Herrera <angel.garcia@sygel.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    @api.depends("pos_module_pos_restaurant", "pos_config_id")
    def _compute_pos_module_pos_restaurant(self):
        for res_config in self:
            if (
                not res_config.pos_module_pos_restaurant
                and res_config.pos_config_id.iface_printbill
            ):
                res_config.update(
                    {
                        "pos_iface_printbill": True,
                        "pos_iface_splitbill": False,
                    }
                )
        return super(
            ResConfigSettings,
            self.filtered(
                lambda x: x.pos_module_pos_restaurant
                or not res_config.pos_config_id.iface_printbill
            ),
        )
