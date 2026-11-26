from odoo import models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    def _process_pos_ui_product_product(self, products, config_id):
        if config_id and config_id.display_product_quantity:
            product_obj = self.env["product.template"]
            for product_info in products:
                product = product_obj.browse(product_info["id"])
                stock_product = product.product_variant_id or product
                # prepared first main warehouse info
                warehouse_info = [
                    config_id.main_warehouse_id._prepare_vals_for_pos(stock_product)
                ]
                # prepared additional warehouses info
                for warehouse in config_id.additional_warehouse_ids:
                    warehouse_info.append(
                        warehouse._prepare_vals_for_pos(stock_product)
                    )
                product_info["warehouse_info"] = warehouse_info
        return super()._process_pos_ui_product_product(products, config_id)

    def get_product_info_pos(
        self, price, quantity, pos_config_id, product_variant_id=False
    ):
        product_info = super().get_product_info_pos(
            price, quantity, pos_config_id, product_variant_id=product_variant_id
        )
        config = self.env["pos.config"].browse(pos_config_id)
        if not config.display_product_quantity:
            return product_info

        product_or_variants = (
            self.env["product.product"].browse(product_variant_id)
            if product_variant_id
            else self.product_variant_ids
        )
        warehouses = config.main_warehouse_id | config.additional_warehouse_ids
        product_info["warehouses"] = [
            warehouse._prepare_product_info_for_pos(product_or_variants)
            for warehouse in warehouses
        ]
        return product_info
