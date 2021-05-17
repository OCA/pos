
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

from odoo import models, api


class PosOrder(models.Model):
    _inherit = "pos.order"

    def partial_refund(self, partial_return_wizard):
        """
        Overwrite this function completely in order to add the value
        for `is_scrap`
        """
        ctx = dict(self.env.context, partial_refund=True)
        res = self.with_context(ctx).refund()
        new_order = self._blank_refund(res)
        for wizard_line in partial_return_wizard.line_ids:
            qty = -wizard_line.qty
            if qty != 0:
                copy_line = wizard_line.pos_order_line_id.copy(
                    {
                        'order_id': new_order.id,
                        'returned_line_id': wizard_line.pos_order_line_id.id,
                        'qty': qty,
                        'is_scrap': wizard_line.is_scrap
                    }
                )
                copy_line._onchange_amount_line_all()
        new_order._onchange_amount_all()
        return res

    def _force_picking_done(self, picking):
        """
        Force picking in order to be set as done.
        Then check and move some scrap products
        """
        super(PosOrder, self)._force_picking_done(picking)
        if picking.state == 'done':
            lines = self.lines.filtered(lambda l: l.is_scrap)
            StockScrap = self.env['stock.scrap'].sudo()
            for line in lines:
                vals = StockScrap.default_get(StockScrap.fields_get_keys())
                vals.update({
                    'product_id': line.product_id.id,
                    'picking_id': picking.id,
                    'scrap_qty': abs(line.qty)
                })
                new_record = StockScrap.new(vals)
                new_record._onchange_picking_id()
                new_record.onchange_product_id()
                vals = StockScrap._convert_to_write(new_record._cache)
                scrap = StockScrap.create(vals)
                scrap.action_validate()
