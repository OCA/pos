# -*- coding: utf-8 -*-
# Copyright 2015-2017 UAB Versada (<http://www.versada.lt>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _order_account(self):
        account_def = self.env['ir.property'].get(
            'property_account_receivable_id', 'res.partner')
        return (
            self.partner_id and
            self.partner_id.property_account_receivable_id.id and
            self.partner_id.property_account_receivable_id.id or
            self and account_def.id
        )

    def _create_account_move_line(self, session=None, move=None):
        to_ret = super(PosOrder, self)._create_account_move_line(
            session=session, move=move)

        grouped_data = {}

        for order in self:
            order_account = self._order_account()
            debit = ((order.amount_total > 0) and order.amount_total) or 0.0
            key = (order.partner_id.id, order_account, debit > 0)
            grouped_data.setdefault(key, [])
            for each in order.statement_ids:
                if each.account_id.id != order_account:
                    continue
                for journal_entry in each.journal_entry_ids:
                    for line in journal_entry.line_ids:
                        if (line.account_id.id == order_account):
                            grouped_data[key].append(line.id)
        for key, value in grouped_data.iteritems():
            for line in order.account_move.line_ids:
                if (line.partner_id.id == key[0] and
                        line.account_id.id == key[1] and
                        (line.debit > 0) == key[2]):
                    grouped_data[key].append(line.id)
                    break
        for key, value in grouped_data.iteritems():
            if not value:
                continue
            self.env['account.move.line'].browse(value).reconcile()
        return to_ret
