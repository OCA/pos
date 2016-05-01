# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models, api


class PosSession(models.Model):
    _inherit = 'pos.session'

    @api.multi
    @api.depends('order_ids.lines.price_subtotal_incl')
    def _compute_orders(self):
        for session in self:
            session.order_qty = len(session.order_ids)
            session.total_amount = sum(
                session.mapped('order_ids.amount_total'))

    total_amount = fields.Monetary(
        compute='_compute_orders', string='Transactions Total', multi='orders',
        store=True)

    order_qty = fields.Integer(
        compute='_compute_orders', string='Orders Qty', multi='orders',
        store=True)
