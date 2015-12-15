# -*- coding: utf-8 -*-
# Copyright 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields, api, _
from collections import defaultdict


class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.multi
    def _get_move_lines_for_globalization(self):
        """ Get all move lines for globalization by journal-account"""
        self.ensure_one()
        grouped_move_lines = defaultdict(list)
        for st in self.statement_ids:
            if st.journal_id.pos_payment_globalization:
                # One move per journal and account combination
                key = (st.journal_id.pos_payment_globalization_account.id,
                       st.journal_id.pos_payment_globalization_journal.id)
                debit_account_id =\
                    st.journal_id.default_debit_account_id.id
                lines = st.move_line_ids.filtered(
                    lambda r: r.account_id.id == debit_account_id)
                grouped_move_lines[key].extend(lines)
        return grouped_move_lines

    @api.model
    def _create_globalization_move(self, journal_id, period_id):
        """Create the globalization move"""
        entries_vals = {
            'journal_id': journal_id,
            'period_id': period_id,
            'date': fields.Date.today(),
            'name': "%s - %s" % (
                self.name, _("Payment globalization")),
        }
        return self.env['account.move'].create(entries_vals)

    @api.model
    def _create_globalization_counterpart_line(self, debit, credit, account_id,
                                               move):
        """Create the globalization counterpart line"""
        item_vals = {
            'name': _("Payment globalization counterpart"),
            'credit': credit,
            'debit': debit,
            'account_id': account_id,
            'move_id': move.id
        }
        return self.env['account.move.line'].create(item_vals)

    @api.model
    def _create_reverse_line(self, line_to_reverse, move):
        """Create move line the reverse payment line in entries
           genereted by pos"""
        item_vals = {
            'name': "%s - %s" % (
                line_to_reverse.name, _("Payment globalization")),
            'credit': line_to_reverse.debit,
            'debit': line_to_reverse.credit,
            'account_id': line_to_reverse.account_id.id,
            'move_id': move.id
        }
        return self.env['account.move.line'].create(item_vals)

    @api.multi
    def _generate_globalization_entries(self):
        """Generate globalization moves"""
        self.ensure_one()
        grouped_move_lines = self._get_move_lines_for_globalization()
        to_reconcile = []
        period = self.env['account.period'].find()
        for key, lines in grouped_move_lines.iteritems():
            global_account_id, global_journal_id = key
            move = self._create_globalization_move(global_journal_id,
                                                   period.id)
            counterpart_debit = 0.0
            counterpart_credit = 0.0
            for line in lines:
                counterpart_debit += line.debit
                counterpart_credit += line.credit
                new_line = self._create_reverse_line(line, move)
                # Pair to reconcile : payment line and the reverse line
                to_reconcile.append(line + new_line)
            if counterpart_debit:
                self._create_globalization_counterpart_line(
                    counterpart_debit, 0.0, global_account_id, move)
            if counterpart_credit:
                self._create_globalization_counterpart_line(
                    0.0, counterpart_credit, global_account_id, move)
        for lines in to_reconcile:
            lines.reconcile()

    @api.multi
    def wkf_action_close(self):
        res = super(PosSession, self).wkf_action_close()
        for record in self:
            # Call the method to generate globalization entries
            record._generate_globalization_entries()
        return res
