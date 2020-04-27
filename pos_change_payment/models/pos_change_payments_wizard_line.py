# coding: utf-8
# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, fields, models


class PosChangePaymentsWizardLine(models.TransientModel):
    _name = 'pos.change.payments.wizard.line'

    wizard_id = fields.Many2one(
        comodel_name='pos.change.payments.wizard', ondelete='cascade')

    new_journal_id = fields.Many2one(
        comodel_name='account.journal', string='Journal', required=True,
        domain=lambda s: s._domain_new_journal_id())

    amount = fields.Float(string='Amount', required=True)

    @api.model
    def _domain_new_journal_id(self):
        PosOrder = self.env['pos.order']
        order = PosOrder.browse(self.env.context.get('active_id'))
        return [('id', 'in', order.session_id.journal_ids.ids)]
