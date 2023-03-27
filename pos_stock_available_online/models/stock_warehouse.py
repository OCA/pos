from odoo import models


class StockWarehouse(models.Model):
    _inherit = "stock.warehouse"

    def _prepare_vals_for_pos(self, product):
        """
        Prepare warehouse info data to send a POS
        """
        self.ensure_one()
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "quantity": product.with_context(warehouse=self.id).immediately_usable_qty,
            "product_id": product.id,
        }
