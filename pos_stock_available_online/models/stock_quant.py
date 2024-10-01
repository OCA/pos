from odoo import models


class StockQuant(models.Model):
    _name = "stock.quant"
    _inherit = ["stock.quant", "stock.notifier.pos.mixin"]

    def write(self, vals):
        res = super().write(vals)
        self._notify_pos()
        return res

    def _skip_notify_pos(self):
        self.ensure_one()
        return (
            self.env.context.get("skip_quant_notify_pos", False)
            or super()._skip_notify_pos()
        )

    def _get_warehouses_to_notify(self):
        warehouses = super()._get_warehouses_to_notify()
        warehouses |= self.warehouse_id
        return warehouses
