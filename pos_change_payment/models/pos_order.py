# coding: utf-8
# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import _, api, models
from openerp.exceptions import Warning as UserError


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Overload Section
    @api.multi
    def action_paid(self):
        """ Merge all cash statement line of the Order"""
        self._merge_cash_payment()
        return super(PosOrder, self).action_paid()

    @api.multi
    def add_payment_v8(self, data):
        """Hack to call old api. TODO-V10 : remove me."""
        for order in self:
            self.pool['pos.order'].add_payment(
                self._cr, self._uid, order.id, data, context=self._context)
        return True

    # Private Function Section
    @api.multi
    def _merge_cash_payment(self):
        for order in self:
            cash_statements = order.statement_ids.filtered(
                lambda x: x.journal_id.type == 'cash')
            if len(cash_statements) < 2:
                continue

            main_statement = cash_statements[0]
            cash_total = sum(cash_statements.mapped('amount'))

            # Unlink all statements except one
            cash_statements.filtered(
                lambda x: x.id != main_statement.id).unlink()
            main_statement.write({'amount': cash_total})

    @api.multi
    def _allow_change_payments(self):
        """Return True if the user can change the payment of a POS, depending
        of the state of the current session."""
        closed_orders = self.filtered(
            lambda x: x.session_id.state == 'closed')
        if len(closed_orders):
            raise UserError(_(
                "You can not change payments of the POS '%s' because"
                " the associated session '%s' has been closed!" % (
                    ', '.join(closed_orders.mapped('name')),
                    ', '.join(closed_orders.mapped('session_id.name')))))
