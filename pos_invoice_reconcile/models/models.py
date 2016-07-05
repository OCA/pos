# -*- encoding: utf-8 -*-
#   Copyright 2016 SDI Juan Carlos Montoya  <jcmontoya@sdi.es>
#   Copyright 2016 SDI  Javier Garcia   <jgarcia@sdi.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import models, api


class PosSession(models.Model):
    _inherit = 'pos.session'

    # override _confirm_orders point_of_sale
    @api.multi
    def _confirm_orders(self):
        acc_default = self.env['ir.property'].get(
            'property_account_receivable', 'res.partner')
        grouped_data = {}
        # Filter only invoiced pos orders
        orders = self.order_ids.filtered(lambda o: o.state == "invoiced")
        for order in orders:
            current_company = order.sale_journal.company_id
            order_account = (
                order.partner_id and
                order.partner_id.property_account_receivable and
                order.partner_id.property_account_receivable.id or
                acc_default and acc_default.id or
                current_company.account_receivable.id
            )
            debit = ((order.amount_total > 0) and order.amount_total) or 0.0
            key = (order.partner_id.id, order_account, debit > 0)
            grouped_data.setdefault(key, [])

            for statement in order.statement_ids:
                if statement.account_id.id != order_account:
                    continue

                for line in statement.journal_entry_id.line_id:
                    account_id = line.account_id.id
                    if account_id == order_account and line.state == 'valid':
                        grouped_data[key].append(line.id)

            for key, value in grouped_data.iteritems():
                for line in order.invoice_id.move_id.line_id:
                    if self._check_valid_line(line, key):
                        grouped_data[key].append(line.id)

            # reconcile invoice
            for key, value in grouped_data.iteritems():
                if not value:
                    continue
                context = self._context.copy()
                context.update({'active_ids': value})
                self.env['account.move.line.reconcile'].with_context(
                    context).trans_rec_reconcile_full()

            grouped_data.clear()

        return super(PosSession, self)._confirm_orders()

    def _check_valid_line(self, line, key):
        result = True
        if not line.partner_id.id == key[0]:
            return False
        if not line.account_id.id == key[1]:
            return False
        if not (line.debit > 0) == key[2]:
            return False
        if not line.state == 'valid':
            return False
        return result
