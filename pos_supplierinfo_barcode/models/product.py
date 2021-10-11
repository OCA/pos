import json

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    # technical field used in POS frontend
    supplier_barcode_json = fields.Char(
        "Supplier barcode list", readonly=True, compute="_compute_supplier_barcode_json"
    )

    def _compute_supplier_barcode_json(self):
        for t in self:
            supplier_barcode_json = [x for x in t.mapped("seller_ids.barcode") if x]
            t.supplier_barcode_json = json.dumps(supplier_barcode_json)
