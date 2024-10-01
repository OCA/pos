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
