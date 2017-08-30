# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
# Hendrix Costa <hendrix.costa@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.report import report_sxw
from openerp import models


class DetailsPosSessionReport(report_sxw.rml_parse):

    def _get_qtd_payments(self, line):
        if line.amount < 0:
            return ''

        for statement_bank_line in line.pos_statement_id.statement_ids:
            if statement_bank_line.amount < 0:
                return len(line.pos_statement_id.statement_ids)-1
        return len(line.pos_statement_id.statement_ids)

    def _get_account_bank_statement_lines(self):
        pos_session_obj = self.pool.get('pos.session').browse(
            self.cr, self.uid, self.ids, context='')
        statements_lines = []
        lines_done = []

        for pos_session in pos_session_obj:
            for statement in pos_session.statement_ids:
                for line in statement.line_ids:
                    if (not (line.id in lines_done) or line.amount < 0):
                        result = {
                            'id': line.id,
                            'name': line.name,
                            'date': line.date,
                            'ref': line.ref,
                            'amount': line.amount,
                            'partner_id': line.partner_id,
                            'journal_id': line.journal_id,
                            'pos_statement_id': line.pos_statement_id,
                            'qtd_payments': self._get_qtd_payments(line)
                        }
                        statements_lines.append(result)
                        if line.amount < 0:
                            lines_done.append(line.id)
                        else:
                            lines_done.extend(
                                line.pos_statement_id.statement_ids.ids
                            )
        lines_sorted = sorted(
            statements_lines,
            key=lambda lines_sorted: lines_sorted['qtd_payments']
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
