# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models, _
from odoo.exceptions import UserError


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    _sql_constraints = [('pos_reference_uniq',
                         'unique (pos_reference, session_id)',
                         'The pos_reference must be uniq per session')]

    pos_reference = fields.Char(
        string='Receipt Ref', readonly=True, copy=False, default='')
    session_id = fields.Many2one(
        'pos.session', string='Session',
        index=1, domain="[('state', '=', 'opened')]",
        states={'draft': [('readonly', False)]}, readonly=True)

    @api.model
    def _prepare_order_from_pos(self, order_data):
        session_obj = self.env['pos.session']
        partner_id = self.env['res.partner'].browse(order_data['partner_id'])
        session = session_obj.browse(order_data['pos_session_id'])
        if not partner_id:
            if session.config_id.anonymous_partner_id:
                partner_id = session.config_id.anonymous_partner_id
            else:
                raise UserError(
                    _("Partner is required for sale order."
                      " You must configure an anonymous partner "
                      "on pos config"))
        pricelist_id = partner_id.property_product_pricelist
        if not pricelist_id:
            pricelist_id = session.config_id.pricelist_id
        res = {
            'partner_id': partner_id.id,
            'origin': _("Point of Sale %s") % (session.name),
            'user_id': order_data['user_id'] or False,
            'order_line': [],
            'pricelist_id': pricelist_id.id,
            'session_id': session.id,
            'pos_reference': order_data['name'],
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
        vals = line_obj.play_onchanges(vals, ['product_id'])
        return vals

    @api.model
    def create_order_from_pos(self, order_data):
        # Create Draft Sale order
        vals = self._prepare_order_from_pos(order_data)
        vals = self.play_onchanges(vals, 'partner_id')
        sale_order = self.create(vals)
        for line_data in order_data['lines']:
            line_vals = self._prepare_order_line_from_pos(
                line_data[2], sale_order)
            self.env['sale.order.line'].create(line_vals)

        # Confirm Sale Order
        if order_data['sale_order_state'] in\
                ['confirmed', 'delivered', 'invoiced']:
            sale_order.action_confirm()

        # mark picking as delivered
        if order_data['sale_order_state'] in ['delivered', 'invoiced']:
            sale_order.picking_ids.force_assign()
            sale_order.picking_ids.do_transfer()

        # generate invoice
        if order_data.get('to_invoice', False):
            invoice = sale_order.pos_invoice_create(
                pos_order_state=order_data['sale_order_state'])
            if invoice:
                invoice.action_invoice_open()
                invoice.write({
                    'session_id': sale_order.session_id.id
                })
        return {
            'sale_order_id': sale_order.id,
        }

    @api.multi
    def pos_invoice_create(self, pos_order_state=False):
        self.ensure_one()
        # generate invoice if order is delivred
        # Indeed if product are configured as
        # "invoice deliverd quantities ", and order is not delivered,
        # the invoice genrated will be with amount 0.
        if self.pos_order_is_invoiceble(pos_order_state=pos_order_state):
            inv_obj = self.env['account.invoice']
            inv_id = self.action_invoice_create()
            inv = inv_obj.browse(inv_id)
            inv.action_invoice_open()

    @api.model
    def pos_order_is_invoiceble(self, pos_order_state=False):
        """
        You can henerit this method to change invoicable condition
        """
        if pos_order_state == 'invoiced':
            return True
        return False
