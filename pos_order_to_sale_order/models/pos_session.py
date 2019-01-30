# coding: utf-8
# @author: Mourad EL HADJ MIMOUNE <mourad.elhadj.mimoune@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, api, _
from odoo.exceptions import Warning as UserError


class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.multi
    def _get_so_domains(
            self, vals, anonym_partner_id, anonym_order=True):
        self.ensure_one()
        vals = [('session_id', '=', self.id)]
        if not self.env.context.get('generated_invoice', False):
            vals.append(('state', '=', 'manual'),)
            if anonym_order:
                vals.append(('partner_id', '=', anonym_partner_id),)
            else:
                vals.append(('partner_id', '!=', anonym_partner_id),)
        return vals

    @api.multi
    def _confirm_orders(self):
        for session in self:
            partner_id = session.config_id.anonymous_partner_id.id
            invoices = self.env['account.invoice'].browse(False)
            # invoiced order : get generated invoice
            # and reconcile it with pos payment
            generated_invoices = self._get_generated_invoice(
                partner_id=False, grouped=False, anonym_order=False,
                anonym_journal=False)
            generated_invoices.action_invoice_open()

            self._reconcile_invoice_with_pos_payment(generated_invoices)
            invoices |= generated_invoices
            # anonym orders : generate grouped invoice for anonym patner
            # and reconcile it with pos payment
            grouped_anonym_invoice = session._generate_invoice(
                partner_id=partner_id,
                grouped=True, anonym_order=True, anonym_journal=True)
            self._reconcile_invoice_with_pos_payment(grouped_anonym_invoice)
            invoices |= grouped_anonym_invoice
            # not anonym orders : generate invoices for not anonym partner
            # and reconcile their with pos payment
            invoice_not_anonym = session._generate_invoice(
                partner_id=partner_id,
                grouped=False, anonym_order=False, anonym_journal=False)
            self._reconcile_invoice_with_pos_payment(invoice_not_anonym)
            invoices |= invoice_not_anonym
            return invoices
        return True

    @api.multi
    def _get_generated_invoice(self, partner_id=False, grouped=False,
                               anonym_order=False, anonym_journal=False):
        self.ensure_one()
        domains = {}
        domains = self.with_context(generated_invoice=True)._get_so_domains(
            domains, partner_id, anonym_order=anonym_order)
        invoices = self.env['account.invoice'].browse(False)
        for order in self.env['sale.order'].search(domains):
            not_cancel_inv = order.invoice_ids.filtered(
                        lambda inv: inv.state not in ['cancel',])
            if not_cancel_inv:
                invoices |= not_cancel_inv
        return invoices

    @api.multi
    def _generate_invoice(
            self, partner_id=False, grouped=False,
            anonym_order=True, anonym_journal=True,
            orders=False):
        if not self:
            raise UserError(
                _("No POS session opened by your user. Please, open one."))
        self.ensure_one()
        sale_obj = self.env['sale.order']
        if not orders:
            domains = {}
            domains = self._get_so_domains(
                domains, partner_id, anonym_order=anonym_order)
            orders = sale_obj.search(domains)
        orders = orders.filtered(lambda so: so.invoice_status == 'to invoice')
        pos_anonym_journal = False
        invoices = self.env['account.invoice'].browse(False)
        if not orders:
            return invoices
        if anonym_journal:
            pos_anonym_journal = self.config_id.journal_id

        if grouped:
            return self._generate_partner_invoice(
                orders, pos_anonym_journal, grouped, anonym_order)
        for sale in orders:
            invoices |= self._generate_partner_invoice(
                sale, pos_anonym_journal, grouped, anonym_order)
        return invoices

    def _generate_partner_invoice(
            self, sale, pos_anonym_journal, grouped, anonym_order):
        print sale
        invoice_id = sale.with_context(
            pos_anonym_journal=pos_anonym_journal
        ).action_invoice_create(grouped=not grouped)
        invoice = self.env['account.invoice'].browse(invoice_id)
        if anonym_order:
            invoice.write({'pos_anonyme_invoice': True})
        sale.signal_workflow('manual_invoice')
        invoice.action_invoice_open()
        invoice.write({
            # 'sale_ids': [(6, 0, sale.ids)],
            'session_id': self.id
        })
        return invoice

    def _reconcile_invoice_with_pos_payment(
            self, invoices):
        if not invoices:
            return False
        for invoice in invoices:
            if invoice.state == 'open':
                sale_ids = invoice.invoice_line_ids.mapped(
                    'sale_line_ids').mapped('order_id').filtered(
                        lambda r: r.state not in ['draft', 'sent'])
                pay_reconcilable_ids = sale_ids.mapped(
                    'statement_ids.journal_entry_ids.line_ids').filtered(
                    lambda r: r.account_id == invoice.account_id)
                # exclude reconciled line
                pay_reconcilable_ids = pay_reconcilable_ids.filtered(
                    lambda r: not r.reconciled)
                # sort by debit to take into account return cash
                invoice.register_payment(pay_reconcilable_ids.sorted(
                    key=lambda r: r.debit))
        return True
