# coding: utf-8
# Copyright (C) 2015-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import _, api, models
from openerp.exceptions import ValidationError


class AccountBankStatementLine(models.Model):
    _inherit = 'account.bank.statement.line'

    _POS_PAYMENT_ALLOW_WRITE = [
        'sequence', 'journal_entry_id',
    ]

    # Private Function Section
    @api.multi
    def _check_allow_change_pos_payment(self, vals):
        """Allow or block change of account bank statement line, linked to
        a non draft POS Order.
            * if 'change_pos_payment' is in the context, changes are allowed;
            * otherwise:
                * allow write of some fields only;
            * forbid deletion;"""
        values = vals.copy() if vals else {}
        check_pos_order = False

        if values:
            # Allow some write
            for key in self._POS_PAYMENT_ALLOW_WRITE:
                if key in values:
                    del values[key]
            if not values:
                return

        # Allow changes, if user use the wizard
        if self._context.get('change_pos_payment', False):
            check_pos_order = True

        for statement_line in self:
            order = statement_line.pos_statement_id
            if order:
                if order.state != 'draft':
                    if check_pos_order:
                        order._allow_change_payments()
                    else:
                        if values.keys() == ['partner_id']:
                            order._allow_change_payments()
                        else:
                            raise ValidationError(_(
                                "You can not change payments of POS by this"
                                " way. Please use the regular wizard in POS"
                                " view!"))

    # Overload Section
    @api.multi
    def write(self, vals):
        self._check_allow_change_pos_payment(vals)
        return super(AccountBankStatementLine, self).write(vals)

    @api.multi
    def unlink(self):
        self._check_allow_change_pos_payment(None)
        return super(AccountBankStatementLine, self).unlink()
