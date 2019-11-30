# -*- coding: utf-8 -*-
# Copyright 2019 Jacques-Etienne Baudoux (BCIM sprl) <je@bcim.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import api, models, fields


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.multi
    def test_paid(self):
        """A Point of Sale is paid when the sum
        @return: True
        """
        for order in self:
            if order.lines and not order.amount_total:
                return True
            if not order.lines:
                return False
            if not order.statement_ids:
                return False
            amount = abs(order.amount_total-order.amount_paid)
            if any(order.statement_ids.mapped('journal_id.round_payment')):
                test = 0.021
            else:
                test = 0.009
            if amount >= test:
                return False
        return True
