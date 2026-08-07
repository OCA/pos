from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    # def _load_pos_data_read(self, records, config):
    #     if config.display_default_code:
    #         self = self.with_context(display_default_code=True)
    #     return super()._load_pos_data_read(records, config)


class ProductTemplate(models.Model):
    _inherit = "product.template"

    # def _load_pos_data_read(self, records, config):
    #     if config.display_default_code:
    #         self = self.with_context(display_default_code=True)
    #     return super()._load_pos_data_read(records, config)
