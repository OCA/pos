# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result["search_params"]["fields"].append("barcodes_json")
        return result

    def find_product_by_barcode(self, barcode, config_id):
        product_fields = self.env["product.product"]._load_pos_data_fields(config_id)
        product_context = {**self.env.context, "display_default_code": False}
        results = super().find_product_by_barcode(barcode, config_id)
        products = self.env["product.product"].search(
            [
                ("barcode_ids.name", "=", barcode),
                ("sale_ok", "=", True),
                ("available_in_pos", "=", True),
            ]
        )
        if products:
            results["product.product"] += products.with_context(**product_context).read(
                product_fields, load=False
            )
        return results
