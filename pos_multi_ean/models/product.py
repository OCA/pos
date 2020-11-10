import json

from odoo import fields, models


class Product(models.Model):
    _inherit = "product.product"

    # technical field used in POS frontend
    multi_ean_json = fields.Char(
        "Multi EAN list", readonly=True, compute="_compute_multi_ean_json"
    )

    def _compute_multi_ean_json(self):
        for p in self:
            multi_ean_json = [x for x in p.mapped("ean13_ids.name") if x]
            p.multi_ean_json = json.dumps(multi_ean_json)
