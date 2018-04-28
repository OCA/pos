# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, api, _


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.model
    def _prepare_order_field_from_pos(self, order_data):
        session_obj = self.env['pos.session']
        session = session_obj.browse(order_data['pos_session_id'])
        res = self.onchange_partner_id(order_data['partner_id'])['value']
        res.update({
            'partner_id':       order_data['partner_id'] or False,
            'origin':           _("Point of Sale %s") % (session.name),
            'client_order_ref': order_data['name'],
            'user_id':          order_data['user_id'] or False,
            'order_line':       [],
        })
        if self.env.context.get('is_pos_pricelist'):
            res.update({
                'pricelist_id': order_data['pricelist_id'],
            })
        for line_data in order_data['lines']:
            res['order_line'].append([
                0, False, self._prepare_order_line_field_from_pos(
                    line_data[2], res)])
        return res

    @api.model
    def _prepare_order_line_field_from_pos(self, line_data, sale_order_data):
        line_obj = self.env['sale.order.line']
        res = line_obj.product_id_change(
            sale_order_data['pricelist_id'], line_data['product_id'],
            qty=line_data['qty'],
            partner_id=sale_order_data['partner_id'])['value']
        res.update({
            'product_id': line_data['product_id'],
            'product_uom_qty': line_data['qty'],
            'discount': line_data['discount'],
            'tax_id': [(6, False, res['tax_id'])],
        })
        if self.env.context.get('is_pos_pricelist'):
            res.update({
                'price_unit': line_data['price_unit'],
                'tax_id': line_data['tax_ids'],
            })
        return res

    @api.model
    def create_order_from_pos(self, order_data):
        is_pos_pricelist = len(self.env['ir.module.module'].search(
            [('name', '=', 'pos_pricelist'), ('state', '=', 'installed')]))
        # Create Draft Sale order
        sale_order = self.create(
            self.with_context(is_pos_pricelist=is_pos_pricelist).
            _prepare_order_field_from_pos(order_data))

        # Confirm Sale Order
        if order_data['sale_order_state'] in ['confirmed', 'delivered']:
            sale_order.action_button_confirm()

        # mark picking as delivered
        if order_data['sale_order_state'] == 'delivered':
            sale_order.picking_ids.force_assign()
            sale_order.picking_ids.do_transfer()

        return {
            'sale_order_id': sale_order.id,
        }
