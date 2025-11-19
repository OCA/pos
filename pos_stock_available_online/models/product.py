from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def _process_pos_ui_product_product(self, products, config_id):
        if config_id and config_id.display_product_quantity:
            product_obj = self.env["product.product"]
            for product_info in products:
                product = product_obj.browse(product_info["id"])
                # prepared first main warehouse info
                warehouse_info = [
                    config_id.main_warehouse_id._prepare_vals_for_pos(product)
                ]
                # prepared additional warehouses info
                for warehouse in config_id.additional_warehouse_ids:
                    warehouse_info.append(warehouse._prepare_vals_for_pos(product))
                product_info["warehouse_info"] = warehouse_info
        return super()._process_pos_ui_product_product(products, config_id)
