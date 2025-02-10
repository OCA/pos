from odoo import api, models


class IrModuleModule(models.Model):
    _inherit = "ir.module.module"

    @api.model
    def _load_pos_data_fields(self, config_id=None):
        return super()._load_pos_data_fields()
