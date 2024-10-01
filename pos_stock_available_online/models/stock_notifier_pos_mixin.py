from odoo import models


class StockNotifierPosMixin(models.AbstractModel):
    _name = "stock.notifier.pos.mixin"
    _description = "Stock Notifier POS Mixin"

    def _prepare_pos_message(self):
        """
        Return prepared message to send to POS
        """
        self.ensure_one()
        return self.warehouse_id._prepare_vals_for_pos(self.product_id)

    def _skip_notify_pos(self):
        """
        Skip notification to POS
        """
        return False

    def _get_warehouses_to_notify(self):
        self.ensure_one()
        return self.env["stock.warehouse"]

    def _notify_pos(self):
        """
        Send notification to POS
        """
        pos_session_obj = self.env["pos.session"]
        for record in self:
            if record._skip_notify_pos():
                continue
            for warehouse in self._get_warehouses_to_notify():
                configs = pos_session_obj.search(
                    [
                        ("state", "=", "opened"),
                        ("config_id.display_product_quantity", "=", True),
                        "|",
                        ("config_id.additional_warehouse_ids", "in", [warehouse.id]),
                        ("config_id.main_warehouse_id", "=", warehouse.id),
                        "|",
                        ("config_id.iface_available_categ_ids", "=", False),
                        (
                            "config_id.iface_available_categ_ids",
                            "in",
                            [record.product_id.pos_categ_id.id],
                        ),
                    ],
                ).mapped("config_id")
                if configs:
                    configs._notify_available_quantity(record._prepare_pos_message())
