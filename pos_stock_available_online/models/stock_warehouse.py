from odoo import models


class StockWarehouse(models.Model):
    _inherit = "stock.warehouse"

    def _prepare_vals_for_pos(self, product):
        """
        Prepare warehouse info data to send a POS
        """
        self.ensure_one()
        quantity = self.env["stock.quant"]._get_available_quantity(
            product,
            self.lot_stock_id,
        )
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "quantity": quantity,
            "product_id": product.id,
            "product_tmpl_id": product.product_tmpl_id.id,
            "uom_id": product.uom_id.id,
        }

    def _prepare_product_info_for_pos(self, products):
        self.ensure_one()
        quantity = sum(
            self.env["stock.quant"]._get_available_quantity(
                product,
                self.lot_stock_id,
            )
            for product in products
        )
        forecasted_quantity = sum(
            products.with_context(warehouse_id=self.id).mapped("virtual_available")
        )
        return {
            "id": self.id,
            "name": self.name,
            "available_quantity": quantity,
            "free_qty": quantity,
            "forecasted_quantity": forecasted_quantity,
            "uom": products.uom_id[:1].name,
        }
