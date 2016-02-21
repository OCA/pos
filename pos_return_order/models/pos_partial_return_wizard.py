# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields, api


class PosPartialReturnWizard(models.TransientModel):
    _name = 'pos.partial.return.wizard'

    order_id = fields.Many2one(
        comodel_name='pos.order', string='Order to Return')

    line_ids = fields.One2many(
        comodel_name='pos.partial.return.wizard.line',
        inverse_name='wizard_id', string='Lines to Return')

    @api.multi
    def confirm(self):
        self.ensure_one()
        return self[0].order_id.partial_refund(self[0])

    @api.model
    def default_get(self, fields):
        order_obj = self.env['pos.order']
        res = super(PosPartialReturnWizard, self).default_get(fields)
        order = order_obj.browse(self.env.context.get('active_id', False))
        if order:
            line_ids = []
            for line in order.lines:
                line_ids.append((0, 0, {
                    'pos_order_line_id': line.id,
                    'initial_qty': line.qty,
                    'max_returnable_qty': line.max_returnable_qty([]),
                }))
            res.update({
                'order_id': order.id,
                'line_ids': line_ids})
        return res
