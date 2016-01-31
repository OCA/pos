# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models, api


class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.multi
    @api.depends('statement_ids.balance_end')
    def _compute_total_amount(self):
        for session in self:
            total_amount = 0
            for statement in session.statement_ids:
                total_amount += statement.balance_end
            session.total_amount = total_amount

    @api.multi
    @api.depends('order_ids')
    def _compute_order_qty(self):
        for session in self:
            session.order_qty = len(session.order_ids)

    total_amount = fields.Monetary(
        compute='_compute_total_amount', string='Transactions Total',
        store=True)

    order_qty = fields.Integer(
        compute='_compute_order_qty', string='Orders Qty',
        store=True)
