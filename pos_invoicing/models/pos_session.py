# coding: utf-8
# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

from openerp import api, models

_logger = logging.getLogger(__name__)


class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.multi
    def wkf_action_close(self):
        move_line_obj = self.env['account.move.line']

        res = super(PosSession, self).wkf_action_close()

        # Get All Pos Order invoiced during the current Sessions
        orders = self.order_ids.filtered(lambda x: x.invoice_id)

        for order in orders:
            # Get accounting partner
            partner = order.partner_id.parent_id or order.partner_id

            # Search all Sale Move Lines to reconcile in Sale Journal
            sale_move_lines = []
            sale_total = 0

            for move_line in order.invoice_id.move_id.line_id:
                if (move_line.partner_id.id == partner.id and
                        move_line.account_id.type == 'receivable'):
                    sale_move_lines.append(move_line)
                    sale_total += move_line.debit - move_line.credit

            # Search all move Line to reconcile in Payment Journals
            payment_move_lines = []
            payment_total = 0

            statement_ids = order.mapped('statement_ids.statement_id').ids
            move_lines = move_line_obj.search([
                ('statement_id', 'in', statement_ids),
                ('partner_id', '=', partner.id),
                ('reconcile_id', '=', False)])
            for move_line in move_lines:
                if (move_line.account_id.type == 'receivable'):
                    payment_move_lines.append(move_line)
                    payment_total += move_line.debit - move_line.credit

            # Try to reconcile
            if payment_total != - sale_total:
                # Unable to reconcile
                _logger.warning(
                    "Unable to reconcile the payment of %s #%d."
                    "(partner : %s)" % (
                        order.name, order.id, partner.name))
            else:
                # Reconcile move lines
                move_lines = move_line_obj.browse(
                    [x.id for x in sale_move_lines] +
                    [x.id for x in payment_move_lines])
                move_lines.reconcile('manual', False, False, False)
                # Unflag the invoice as 'PoS Pending Payment'
                order.invoice_id.pos_pending_payment = False

        return res
