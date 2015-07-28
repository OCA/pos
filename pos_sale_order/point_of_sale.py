# -*- encoding: utf-8 -*-
##############################################################################
#
#    POS To Sale Order module for Odoo
#    Copyright (C) 2014 AKRETION (<http://www.akretion.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

import time

from openerp import fields, models, api, _
from openerp.exceptions import Warning


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    pos_reference = fields.Char(string='Receipt Ref',
                                readonly=True,
                                copy=False,
                                default='')
    session_id = fields.Many2one('pos.session', string='Session',
                                 select=1,
                                 domain="[('state', '=', 'opened')]",
                                 states={'draft': [('readonly', False)]},
                                 readonly=True)
    payment_ids = fields.Many2many(readonly=True)


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.multi
    def _prepare_product_onchange_params(self, order, line):
        return [
            (order['pricelist_id'], line['product_id']),
            {
                'qty': line['product_uom_qty'],
                'uom': False,
                'qty_uos': 0,
                'uos': False,
                'name': '',
                'partner_id': order['partner_id'],
                'lang': False,
                'update_tax': True,
                'date_order': False,
                'packaging': False,
                'fiscal_position': False,
                'flag': False,
                'warehouse_id': order['warehouse_id']
            }]

    @api.multi
    def _merge_product_onchange(self, order, onchange_vals, line):
        default_key = [
            'name',
            'product_uos_qty',
            'product_uom',
            'th_weight',
            'product_uos']
        for key in default_key:
            line[key] = onchange_vals.get(key)
        if onchange_vals.get('tax_id'):
            line['tax_id'] = [[6, 0, defaults['tax_id']]]

    @api.multi
    def _update_sale_order_line_vals(self, order, line):
        sale_line_obj = self.env['sale.order.line'].browse(False)
        if line.get('qty'):
            line['product_uom_qty'] = line.pop('qty')
        args, kwargs = self._prepare_product_onchange_params(order, line)

        vals = sale_line_obj.product_id_change_with_wh(*args, **kwargs)
        self._merge_product_onchange(order, vals['value'], line)

    @api.multi
    def _prepare_sale_order_vals(self, ui_order):
        pos_session = self.env['pos.session'].browse(
            ui_order['pos_session_id'])
        config = pos_session.config_id
        if not ui_order['partner_id']:
            partner_id = config.anonymous_partner_id.id
            ui_order['partner_id'] = partner_id
        return {
            'pricelist_id': config.pricelist_id.id,
            'warehouse_id': config.warehouse_id.id,
            'section_id': ui_order.get('section_id') or False,
            'user_id': ui_order.get('user_id') or False,
            'session_id': ui_order['pos_session_id'],
            'order_line': ui_order['lines'],
            'pos_reference': ui_order['name'],
            'partner_id': ui_order.get('partner_id') or False,
            'order_policy': 'manual',
        }

    @api.model
    def create_from_ui(self, orders):
        # Keep only new orders
        sale_obj = self.env['sale.order']
        submitted_references = [o['data']['name'] for o in orders]
        existing_order_ids = sale_obj.search([
            ('pos_reference', 'in', submitted_references),
        ])
        existing_orders = sale_obj.read(existing_order_ids,
                                        ['pos_reference'])
        existing_references = set(
            [o['pos_reference'] for o in existing_orders])
        orders_to_save = [o for o in orders if (
            o['data']['name'] not in existing_references)]

        order_ids = []

        for tmp_order in orders_to_save:
            to_invoice = tmp_order['to_invoice']
            ui_order = tmp_order['data']
            vals = self._prepare_sale_order_vals(ui_order)
            for line in vals['order_line']:
                self._update_sale_order_line_vals(vals, line[2])
            order = sale_obj.create(vals)
            for payments in ui_order['statement_ids']:
                self.add_payment(
                    order.id,
                    self._payment_fields(payments[2]),
                )

            session = self.env['pos.session'].browse(
                ui_order['pos_session_id'])
            if session.sequence_number <= ui_order['sequence_number']:
                session.write(
                    {'sequence_number': ui_order['sequence_number'] + 1})
                session.refresh()

            order.signal_workflow('order_confirm')

            if to_invoice:
                invoice_obj = self.env['account.invoice']
                invoice = invoice_obj.browse(order.invoice_ids.id)
                order.signal_workflow('manual_invoice')
                invoice.signal_workflow('invoice_open')
                invoice.write({'sale_ids': [(6, 0, [order.id])]})

            order_ids.append(order.id)

        return order_ids

    @api.multi
    def _prepare_payment_vals(self, order_id, data):
        context = dict(self._context or {})
        property_obj = self.env['ir.property']
        order = self.env['sale.order'].browse(order_id)
        args = {
            'amount': data['amount'],
            'date': data.get('payment_date', time.strftime('%Y-%m-%d')),
            'name': order.name + ': ' + (data.get('payment_name', '') or ''),
            'partner_id': order.partner_id and (
                self.env['res.partner']._find_accounting_partner(
                    order.partner_id).id or False),
        }
        account_def = property_obj.get('property_account_receivable',
                                       'res.partner')
        args['account_id'] = ((
            order.partner_id and order.partner_id.property_account_receivable
            and order.partner_id.property_account_receivable.id)
            or (account_def and account_def.id) or False)

        if not args['account_id']:
            if not args['partner_id']:
                msg = _('There is no receivable account defined '
                        'to make payment.')
            else:
                msg = _('There is no receivable account defined '
                        'to make payment for the partner: "%s" (id:%d).') % (
                            order.partner_id.name, order.partner_id.id,)
            raise Warning(_('Configuration Error!'), msg)

        context.pop('pos_session_id', False)

        journal_id = data.get('journal', False)
        statement_id = data.get('statement_id', False)
        assert journal_id or statement_id, 'No statement_id '
        'or journal_id passed to the method!'

        for statement in order.session_id.statement_ids:
            if statement.id == statement_id:
                journal_id = statement.journal_id.id
                break
            elif statement.journal_id.id == journal_id:
                statement_id = statement.id
                break

        if not statement_id:
            raise Warning(_('Error!'),
                          _('You have to open at least one cashbox.'))

        args.update({
            'statement_id': statement_id,
            'journal_id': journal_id,
            'ref': order.session_id.name,
            'sale_ids': [(6, 0, [order_id])]
        })

        return args

    @api.multi
    def add_payment(self, order_id, data):
        """Create a new payment for the order"""
        statement_line_obj = self.env['account.bank.statement.line']
        args = self._prepare_payment_vals(order_id, data)
        statement_line_obj.create(args)

        return args['statement_id']


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _get_domains(self, vals, partner_id, session):
        vals = [
            ('session_id', '=', session.id),
            ('state', '=', 'manual'),
            ('partner_id', '=', partner_id),
        ]
        return vals

    @api.multi
    def _confirm_orders(self):
        sale_obj = self.env['sale.order']
        for session in self:
            order_ids = []
            partner_id = session.config_id.anonymous_partner_id.id
            domains = {}
            domains = self._get_domains(domains, partner_id, session)
            orders = sale_obj.search(domains)
            orders.action_invoice_create(grouped=True)
            # Dummy call to workflow, will not create another invoice
            # but bind the new invoice to the subflow
            orders.signal_workflow('manual_invoice')
        return True


class PosConfig(models.Model):
    _inherit = 'pos.config'

    anonymous_partner_id = fields.Many2one(
        'res.partner',
        string='Anonymous Partner')
    warehouse_id = fields.Many2one(
        'stock.warehouse',
        string='Warehouse')
