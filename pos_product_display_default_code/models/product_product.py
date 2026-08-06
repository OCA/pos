from odoo import api, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    @api.model
    def _load_pos_data_read(self, records, config):
        if config.display_default_code:
            records = records.with_context(display_default_code=True)
        else:
            records = records.with_context(display_default_code=False)
        return super()._load_pos_data_read(records, config)
