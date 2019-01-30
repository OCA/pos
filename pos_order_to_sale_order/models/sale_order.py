# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# Copyright (C) 2019  Akretion (http://www.akretion.com)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# @author: Mourad EL HADJ MIMOUNE <mourad.elhadj.mimoune@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import time

from odoo import fields, models, api, _
from odoo.exceptions import Warning as UserError
from odoo.tools import float_is_zero


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
    statement_ids = fields.One2many(
        'account.bank.statement.line',
        'pos_so_statement_id', string='Pos Payments',
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
        # check pos session
        session = self.env['pos.session'].browse(
            order_data['pos_session_id'])
        if not session: 
            raise UserError(_("Aucune session n'a été envoyé par le Pdv"))

        if session.state == 'closing_control' or session.state == 'closed':
            raise UserError(
                u"La session '%s' du PdV est close.\n"
                u"Si vous voullez enregistrer d'autre ventes, "
                u"Fermez votre Pdv et rouvrez le avec une nouvelle session "
                % session.name)        
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
        res = {
            'sale_order_id': sale_order.id,
        }

        prec_acc = self.env['decimal.precision'].precision_get('Account')
        journal_ids = set()

        payments = order_data.get('statement_ids', []) or []
        for payment in payments:
            if payment:
                sale_order.add_payment(
                    self._payment_fields(payment[2]))
                journal_ids.add(payment[2]['journal_id'])

        if session.sequence_number <= order_data['sequence_number']:
            session.write(
                {'sequence_number': order_data['sequence_number'] + 1})
            session.refresh()

        if payments and not float_is_zero(
                order_data['amount_return'], prec_acc):
            cash_journal = session.cash_journal_id
            if not cash_journal:
                # Select for change one of the cash
                # journals used in this payment
                cash_journals = self.env['account.journal'].search([
                    ('type', '=', 'cash'),
                    ('id', 'in', list(journal_ids)),
                ], limit=1)
                if not cash_journals:
                    # If none, select for change one of
                    # the cash journals of the POS
                    # This is used for example when
                    # a customer pays by credit card
                    # an amount higher than total amount
                    # of the order and gets cash back
                    cash_journals = [
                        statement.journal_id for statement
                        in session.statement_ids
                        if statement.journal_id.type == 'cash']
                    if not cash_journals:
                        raise UserError(
                            _("No cash statement found for this session."
                              " Unable to record returned cash."))
                cash_journal = cash_journals[0]
            sale_order.add_payment({
                'amount': -order_data['amount_return'],
                'payment_date': time.strftime('%Y-%m-%d %H:%M:%S'),
                'payment_name': _('return'),
                'journal': cash_journal.id,
            })
        return res

    @api.multi
    def _prepare_invoice(self):
        self.ensure_one()
        res = super(SaleOrder, self)._prepare_invoice()
        res['session_id'] = self.session_id.id
        if self.session_id and self.partner_id == self.env.ref(
                'pos_order_to_sale_order.res_partner_anonymous'):
            res['pos_anonyme_invoice'] = True
            pos_anonym_journal = self.env.context.get(
                'pos_anonym_journal', False)
            if pos_anonym_journal:
                res['journal_id'] = pos_anonym_journal.id
        return res

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

    @api.model
    def _payment_fields(self, ui_paymentline):
        return {
            'amount': ui_paymentline['amount'] or 0.0,
            'payment_date': ui_paymentline['name'],
            'statement_id': ui_paymentline['statement_id'],
            'payment_name': ui_paymentline.get('note', False),
            'journal': ui_paymentline['journal_id'],
        }

    @api.multi
    def _prepare_payment_vals(self, payment_data):
        self.ensure_one()
        context = dict(self.env.context or {})
        property_obj = self.env['ir.property']
        order = self.env['sale.order'].browse(self.id)
        statement_vals = {
            'amount': payment_data['amount'],
            'date': payment_data.get('payment_date', time.strftime('%Y-%m-%d')),
            'name': order.name + ': ' + (payment_data.get('payment_name', '') or ''),
            'partner_id': order.partner_id and (
                self.env['res.partner']._find_accounting_partner(
                    order.partner_id).id or False),
        }
        account_def = property_obj.get('property_account_receivable_id',
                                       'res.partner')
        statement_vals['account_id'] = (
            order.partner_invoice_id.property_account_receivable_id.id or
            (account_def and account_def.id))
        if not statement_vals['account_id']:
            if not statement_vals['partner_id']:
                msg = _('There is no receivable account defined '
                        'to make payment.')
            else:
                msg = _('There is no receivable account defined '
                        'to make payment for the partner: "%s" (id:%d).') % (
                            order.partner_id.name, order.partner_id.id,)
            raise UserError(_('Configuration Error!') + msg)

        context.pop('pos_session_id', False)

        journal_id = payment_data.get('journal', False)
        statement_id = payment_data.get('statement_id', False)
        if not(journal_id or statement_id):
            raise UserError(
                _("No statement_id or journal_id passed to the method!"))

        for statement in order.statement_ids:
            if statement.id == statement_id:
                journal_id = statement.journal_id.id
                break
            elif statement.journal_id.id == journal_id:
                statement_id = statement.statement_id.id
                break

        if not statement_id:
            raise UserError(_('You have to open at least one cashbox.'))

        statement_vals.update({
            'statement_id': statement_id,
            'journal_id': journal_id,
            'pos_so_statement_id': self.id,
            'ref': order.session_id.name,
            'sale_ids': [(6, 0, [self.id])]
        })
        return statement_vals

    @api.multi
    def add_payment(self, payment_data):
        """Create a new payment for the order"""
        statement_line_obj = self.env['account.bank.statement.line']
        statement_vals = self._prepare_payment_vals(payment_data)
        return statement_line_obj.create(statement_vals)
