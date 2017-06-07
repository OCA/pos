# -*- coding: utf-8 -*-
# (c) 2015 Daniel Campos <danielcampos@avanzosc.es> - Avanzosc S.L.
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from openerp import models, api


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    @api.multi
    def action_invoice_create(self, journal_id, group=False,
                              type='out_invoice'):
        res = super(StockPicking, self).action_invoice_create(
            journal_id, group=group, type=type)
        for picking in self:
            pos_order_obj = self.env['pos.order']
            picking_type_id = self.env.ref('point_of_sale.picking_type_posout')
            if picking_type_id.id == picking.picking_type_id.id:
                pos_order = pos_order_obj.search(
                    [('picking_id', '=', picking.id)], limit=1)
                if pos_order:
                    pos_order.invoice_id = picking.invoice_id
                    pos_order.invoice_id.origin += ' / ' + pos_order.name
        return res
