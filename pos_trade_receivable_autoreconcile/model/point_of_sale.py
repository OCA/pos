# -*- coding: utf-8 -*-
# This file is part of OpenERP. The COPYRIGHT file at the top level of
# this module contains the full copyright notices and license terms.

from openerp import models


class POSOrder(models.Model):
    _inherit = "pos.order"

    def _create_account_move_line(self, cr, uid, ids, session=None,
                                  move_id=None, context=None):
        to_ret = super(POSOrder, self)._create_account_move_line(
            cr, uid, ids, session=session, move_id=move_id, context=context)

        account_def = self.pool.get('ir.property').get(
            cr, uid, 'property_account_receivable', 'res.partner')

        grouped_data = {}

        for order in self.browse(cr, uid, ids, context=context):
            current_company = order.sale_journal.company_id
            order_account = (
                order.partner_id and
                order.partner_id.property_account_receivable and
                order.partner_id.property_account_receivable.id or
                account_def and account_def.id or
                current_company.account_receivable.id
            )
            debit = ((order.amount_total > 0) and order.amount_total) or 0.0
            key = (order.partner_id.id, order_account, debit > 0)
            grouped_data.setdefault(key, [])
            for each in order.statement_ids:
                if each.account_id.id != order_account:
                    continue

                for line in each.journal_entry_id.line_id:
                    if line.account_id.id == order_account:
                        grouped_data[key].append(line.id)
        for key, value in grouped_data.iteritems():
            for line in order.account_move.line_id:
                if (line.partner_id.id == key[0] and
                        line.account_id.id == key[1] and
                        (line.debit > 0) == key[2]):
                    grouped_data[key].append(line.id)
                    break
        for key, value in grouped_data.iteritems():
            self.pool.get('account.move.line').reconcile_partial(
                cr, uid, value)

        return to_ret
