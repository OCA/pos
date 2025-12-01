from odoo import api, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    @api.model
    def _load_pos_data_read(self, records, config):
        res = super()._load_pos_data_read(records, config)
        if config.display_default_code:
            for x in res:
                x["name"] = x["display_name"]
        return res
