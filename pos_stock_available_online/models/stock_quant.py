import logging

from odoo import models

_logger = logging.getLogger(__name__)


class StockQuant(models.Model):
    _inherit = "stock.quant"

    def _prepare_pos_message(self):
        """
        Return prepared message to send to POS
        """
        self.ensure_one()
        return self.warehouse_id._prepare_vals_for_pos(self.product_id)

    def _notify_pos(self):
        """
        Send notification to POS
        """
        pos_session_obj = self.env["pos.session"]
        for quant in self:
            warehouse_id = quant.warehouse_id.id
            configs = pos_session_obj.search(
                [
                    ("state", "=", "opened"),
                    ("config_id.display_product_quantity", "=", True),
                    "|",
                    ("config_id.additional_warehouse_ids", "in", [warehouse_id]),
                    ("config_id.main_warehouse_id", "=", warehouse_id),
                    "|",
                    ("config_id.iface_available_categ_ids", "=", False),
                    (
                        "config_id.iface_available_categ_ids",
                        "in",
                        [quant.product_id.pos_categ_id.id],
                    ),
                ],
            ).mapped("config_id")
            if configs:
                configs._notify_available_quantity(quant._prepare_pos_message())

    def write(self, vals):
        res = super().write(vals)
        self._notify_pos()
        return res
