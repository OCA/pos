from odoo import models


class StockMove(models.Model):
    _name = "stock.move"
    _inherit = ["stock.move", "stock.notifier.pos.mixin"]

    def write(self, vals):
        states_dict = {line.id: line.state for line in self} if "state" in vals else {}
        res = super().write(vals)
        if not states_dict:
            return res
        for line in self:
            if states_dict.get(line.id) != line.state:
                line._notify_pos()
        return res

    def _action_done(self, cancel_backorder=False):
        # As stock will be updated once move has updated its state, skip
        #   notification from quant
        return super(
            StockMove, self.with_context(skip_quant_notify_pos=True)
        )._action_done(cancel_backorder=cancel_backorder)

    def _get_warehouses_to_notify(self):
        warehouses = super()._get_warehouses_to_notify()
        warehouses |= self.warehouse_id
        warehouses |= self.location_id.warehouse_id
        warehouses |= self.location_dest_id.warehouse_id
        return warehouses
