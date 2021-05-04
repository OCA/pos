from odoo import models, _
from odoo.tools import float_round


class Order(models.Model):
    _inherit = 'pos.order'

    def _create_account_move_line(self, session=None, move=None):
        res = super(Order, self)._create_account_move_line(session, move)
        if move:
            self._group_lines_by_tax(move)
        return res

    @staticmethod
    def _check_grouping_applicability(lines):
        list_of_date_maturity = lines.mapped('date_maturity')
        if not all(elem == list_of_date_maturity[0] for elem in list_of_date_maturity):
            return False
        if len(lines.filtered(lambda x: x.tax_line_id).mapped('account_id')) > 1:
            return False
        if len(lines.filtered(lambda x: x.tax_ids).mapped('account_id')) > 1:
            return False
        return True

    @staticmethod
    def _get_grouped_lines(move):
        grouped_lines = {}
        for line in move.line_ids:
            if line.tax_line_id or line.tax_ids:
                if len(line.tax_ids) > 1 or line.analytic_account_id:
                    # Impossible to do the group computation in this cases
                    return None
                if line.tax_line_id:
                    key = line.tax_line_id
                elif line.tax_ids:
                    key = line.tax_ids[0]
                if key not in grouped_lines:
                    grouped_lines[key] = line
                else:
                    grouped_lines[key] |= line
        return grouped_lines

    def _group_lines_by_tax(self, move):
        grouped_lines = self._get_grouped_lines(move)
        if not grouped_lines:
            return
        precision = move.company_id.currency_id.decimal_places
        for key in grouped_lines:
            tax = key
            lines = grouped_lines[tax]
            if not self._check_grouping_applicability(lines):
                continue
            untaxed_account = lines.filtered(lambda x: x.tax_ids)[0].account_id
            tax_account = lines.filtered(lambda x: x.tax_line_id)[0].account_id
            date_maturity = lines[0].date_maturity
            total = 0
            for line in lines:
                if line.debit:
                    total -= line.debit
                elif line.credit:
                    total += line.credit
            untaxed_amount = float_round(
                total / (1 + (tax.amount / 100)), precision_digits=precision)
            tax_amount = total - untaxed_amount
            new_lines = [
                (0, 0, {
                    'name': _("%s: untaxed amount") % tax.name,
                    'account_id': untaxed_account.id,
                    'date_maturity': date_maturity,
                    'tax_ids': [(6, 0, [tax.id])],
                    'debit': untaxed_amount if untaxed_amount < 0 else 0,
                    'credit': untaxed_amount if untaxed_amount > 0 else 0,
                }),
                (0, 0, {
                    'name': _("%s: tax") % tax.name,
                    'account_id': tax_account.id,
                    'date_maturity': date_maturity,
                    'tax_line_id': tax.id,
                    'debit': tax_amount if tax_amount < 0 else 0,
                    'credit': tax_amount if tax_amount > 0 else 0,
                }),
            ]
            posted = False
            if move.state == 'posted':
                posted = True
                move.state = 'draft'
            lines.unlink()
            move.write({'line_ids': new_lines})
            if posted:
                move.state = 'posted'
