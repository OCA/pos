import json

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    supplier_data_json = fields.Char(
        "Supplier data dict",
        help="Technical field: Used in POS frontend to search products by supplierinfo",
        compute="_compute_supplier_data_json",
    )

    def _compute_supplier_data_json(self):
        for rec in self:
            rec.supplier_data_json = json.dumps(
                [
                    {
                        "supplier_name": s.name.display_name,
                        "supplier_product_code": s.product_code or "",
                        "supplier_product_name": s.product_name or "",
                    }
                    for s in rec.seller_ids
                ]
            )
