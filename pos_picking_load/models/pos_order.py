# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, api, fields


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Field Section
    origin_picking_id = fields.Many2one(
        string='Origin Picking', comodel_name='stock.picking',
        readonly=True)

    # Overloadable Section
    @api.multi
    def _handle_orders_with_original_picking(self):
        """By default, the module cancel original stock picking and sale
        order. Overload / Overwrite this function if you want another
        behaviour"""
        sale_order_obj = self.env['sale.order']
        for order in self:
            # Cancel Picking
            order.origin_picking_id.action_cancel()
            order.origin_picking_id.write({'final_pos_order_id': order.id})

            # Ignore Delivery exception of the Sale Order
            sale_orders = sale_order_obj.search([
                ('procurement_group_id', '=',
                    order.origin_picking_id.group_id.id)])
#            sale_orders.action_ignore_delivery_exception()
            sale_orders.signal_workflow('ship_corrected')
            sale_orders.write({'final_pos_order_id': order.id})

    # Overload Section
    @api.model
    def create_from_ui(self, orders):
        """Cancel the original picking, when the pos order is done"""
        res = super(PosOrder, self).create_from_ui(orders)
        orders_with_original_picking = self.search([
            ('id', 'in', res), ('origin_picking_id', '!=', False),
            ('state', 'not in', [('draft')])])

        orders_with_original_picking._handle_orders_with_original_picking()

        return res

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        if 'origin_picking_id' in ui_order:
            res['origin_picking_id'] = ui_order['origin_picking_id']
        return res
