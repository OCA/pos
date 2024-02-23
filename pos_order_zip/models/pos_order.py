from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    zip_code = fields.Char()

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res.update({"zip_code": ui_order.get("zip_code", False)})
        return res
