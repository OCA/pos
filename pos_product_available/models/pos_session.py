from odoo import models
from odoo.osv.expression import AND

class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        result = super(PosSession, self)._loader_params_product_product()
        if self.config_id.available_product and self.config_id.available_product_ids:
            result['search_params']['domain'] = AND([result['search_params']['domain'], [('product_tmpl_id', 'in', self.config_id.available_product_ids.ids)]])
        return result