from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _process_pos_ui_product_product(self, products):
        config = self.config_id
        if config.display_product_quantity:
            product_obj = self.env["product.product"]
            for product_info in products:
                product = product_obj.browse(product_info["id"])
                # prepared first main warehouse info
                warehouse_info = [
                    config.main_warehouse_id._prepare_vals_for_pos(product)
                ]
                # prepared additional warehouses info
                for warehouse in config.additional_warehouse_ids:
                    warehouse_info.append(warehouse._prepare_vals_for_pos(product))
                product_info["warehouse_info"] = warehouse_info

        return super()._process_pos_ui_product_product(products)
