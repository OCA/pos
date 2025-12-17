from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def _load_product_with_domain(self, domain, config_id, load_archived=False):
        res = super()._load_product_with_domain(domain, config_id, load_archived)
        pos_config = self.env["pos.config"].search([("id", "=", config_id)])
        if pos_config.display_default_code:
            # We have no choice but overwriting the original method
            # because it's not easy to change context
            fields = self._load_pos_data_fields(config_id)
            res = self.with_context(display_default_code=True).search_read(
                domain, fields, order="sequence,default_code,name", load=False
            )
        return res
