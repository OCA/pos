# Copyright 2025 Ángel García de la Chica Herrera <angel.garcia@sygel.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    @api.depends("pos_module_pos_restaurant", "pos_config_id")
    def _compute_pos_module_pos_restaurant(self):
        res = super()._compute_pos_module_pos_restaurant()
        for res_config in self:
            if (
                not res_config.pos_module_pos_restaurant
                and res_config.pos_config_id.iface_printbill
            ):
                res_config.pos_iface_printbill = True
                res_config.pos_iface_splitbill = False
        return res
