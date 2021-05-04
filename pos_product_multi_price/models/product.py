import json
from odoo import models, fields, api


class Product(models.Model):
    _inherit = 'product.product'

    # technical field used in POS frontend
    price_ids_json = fields.Char(
        "Multi price data dict", readonly=True,
        compute="_compute_price_ids_json")

    @api.multi
    def _compute_price_ids_json(self):
        for p in self:
            res = []
            for price in p.price_ids:
                res.append({
                    'id': price.id,
                    'price_name': price.name.name or '',
                    'price_id': price.name.id or '',
                    'price': price.price,
                })
            p.price_ids_json = json.dumps(res)
