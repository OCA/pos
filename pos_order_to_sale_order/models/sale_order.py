# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, api, _


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.model
    def _prepare_order_from_pos(self, order_data):
        session_obj = self.env['pos.session']
        session = session_obj.browse(order_data['pos_session_id'])
        partner_id = self.env['res.partner'].browse(order_data['partner_id'])
        pricelist_id = partner_id.property_product_pricelist
        res = {
            'partner_id': partner_id.id,
            'origin': _("Point of Sale %s") % (session.name),
            'client_order_ref': order_data['name'],
            'user_id': order_data['user_id'] or False,
            'order_line': [],
            'pricelist_id': pricelist_id.id or False
        }
        return res

    @api.model
    def _prepare_order_line_from_pos(self, line_data, sale_order):
        line_obj = self.env['sale.order.line']
        vals = {
            'product_id': line_data['product_id'],
            'product_uom_qty': line_data['qty'],
            'discount': line_data['discount'],
            'price_unit': line_data['price_unit'],
            'order_id': sale_order.id,
        }
        temp = line_obj.new(vals)
        vals = temp.play_onchanges(vals, ['product_id'])
        return vals

    @api.model
    def create_order_from_pos(self, order_data):
        # Create Draft Sale order
        vals = self._prepare_order_from_pos(order_data)
        temp = self.new(vals)
        vals = temp.play_onchanges(vals, ['partner_id'])
        sale_order = self.create(vals)
        for line_data in order_data['lines']:
            line_vals = self._prepare_order_line_from_pos(
                line_data[2], sale_order)
            self.env['sale.order.line'].create(line_vals)

        # Confirm Sale Order
        if order_data['sale_order_state'] in ['confirmed', 'delivered']:
            sale_order.action_confirm()

        # mark picking as delivered
        if order_data['sale_order_state'] == 'delivered':
            sale_order.picking_ids.force_assign()
            sale_order.picking_ids.do_transfer()

        return {
            'sale_order_id': sale_order.id,
        }
