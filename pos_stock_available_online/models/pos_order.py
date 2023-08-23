from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def create_from_ui(self, orders, draft=False):
        order_ids = super(PosOrder, self).create_from_ui(orders, draft)
        for order in self.sudo().browse([o["id"] for o in order_ids]):
            config = order.config_id
            # send quantity notification after order
            if config and config.display_product_quantity:
                products = order.lines.mapped("product_id")
                warehouse_info = []
                for product in products:
                    # prepared first main warehouse info
                    warehouse_info = [
                        config.main_warehouse_id._prepare_vals_for_pos(product)
                    ]
                    # prepared additional warehouses info
                    for warehouse in config.additional_warehouse_ids:
                        warehouse_info.append(warehouse._prepare_vals_for_pos(product))
                if warehouse_info:
                    config._notify_available_quantity(warehouse_info)
        return order_ids
