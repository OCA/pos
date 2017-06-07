# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
# Hendrix Costa <hendrix.costa@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.report import report_sxw
from openerp import models


class DetailsPosSessionReport(report_sxw.rml_parse):

    def _get_quantity_payments(self, line):
        if line.amount < 0:
            return ''
        quantity_payments = 0
        for statement in line.pos_statement_id.statement_ids:
            if statement.amount > 0 and statement.statement_id.id == line.\
                    statement_id.id:
                quantity_payments += 1
        return quantity_payments

    def _get_lines_from_statements_lines(self, line):
        stats_ids = []
        for stats in line.pos_statement_id.statement_ids:
            if stats.journal_id.id == line.journal_id.id:
                stats_ids.append(stats.id)
        return stats_ids

    def _get_total_by_statement_line(self, line):
        total = 0
        if line.amount < 0:
            return line.amount
        for stats in line.pos_statement_id.statement_ids:
            if stats.journal_id.id == line.journal_id.id and stats.amount > 0:
                total += stats.amount
        return total

    def _get_account_bank_statement_lines(self):
        pos_session_obj = self.pool.get('pos.session').browse(
            self.cr, self.uid, self.ids, context='')
        statements_lines = []
        lines_done = []

        for pos_session in pos_session_obj:
            for statement in pos_session.statement_ids:
                for line in statement.line_ids:
                    if not line.amount == 0:
                        if (not (line.id in lines_done) or line.amount < 0):
                            result = {
                                'id': line.id,
                                'name': line.name,
                                'date': line.date,
                                'ref': line.ref,
                                'amount':
                                    self._get_total_by_statement_line(line),
                                'sub_total': line.amount,
                                'partner_id': line.partner_id,
                                'journal_id': line.journal_id,
                                'pos_statement_id': line.pos_statement_id,
                                'quantity_payments':
                                    self._get_quantity_payments(line)
                            }
                            statements_lines.append(result)
                            if line.amount < 0:
                                lines_done.append(line.id)
                            else:
                                lines_done.extend(
                                    self._get_lines_from_statements_lines(line)
                                )
        lines_sorted = sorted(
            statements_lines,
            key=lambda lines_sorted: lines_sorted['quantity_payments']
        )
        return lines_sorted

    def __init__(self, cr, uid, name, context):
        super(DetailsPosSessionReport, self).__init__(cr, uid, name,
                                                      context=context)
        self.localcontext.update({
            'get_account_bank_statement_lines':
                self._get_account_bank_statement_lines,
        })


class PosSessionReport(models.AbstractModel):
    _name = 'report.pos_session_report.pos_session_report'
    _inherit = 'report.abstract_report'
    _template = 'pos_session_report.pos_session_report'
    _wrapped_report_class = DetailsPosSessionReport
