import json
from odoo import models, fields, api


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # technical field used in POS frontend
    supplier_data_json = fields.Char(
        "Supplier data dict", readonly=True,
        compute="_compute_supplier_data_json")

    @api.multi
    def _compute_supplier_data_json(self):
        for t in self:
            res = []
            for s in t.seller_ids:
                res.append({
                    'supplier_name': s.name.display_name,
                    'supplier_product_code': s.product_code or '',
                    'supplier_product_name': s.product_name or '',
                })
            t.supplier_data_json = json.dumps(res)
