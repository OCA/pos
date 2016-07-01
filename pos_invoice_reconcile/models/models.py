# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright :
#        (c) 2016 SDI
#                 Juan Carlos Montoya <jcmontoya@sdi.es>
#                 Javier Garcia       <jgarcia@sdi.es>
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
from openerp import models, fields, api, _


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
                    if (line.account_id.id == order_account and
                                line.state == 'valid'):
                        grouped_data[key].append(line.id)

            for key, value in grouped_data.iteritems():
                for line in order.invoice_id.move_id.line_id:
                    if (line.partner_id.id == key[0] and
                                line.account_id.id == key[1] and
                                (line.debit > 0) == key[2] and
                                line.state == 'valid'):
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
