# -*- coding: utf-8 -*-
# Copyright 2019 Jacques-Etienne Baudoux (BCIM sprl) <je@bcim.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import api, models


class PosMakePayment(models.TransientModel):
    _inherit = 'pos.make.payment'

    @api.onchange('journal_id')
    def onchange_journal(self):
        active_id = self.env.context.get('active_id', False)
        order = self.env['pos.order'].browse(active_id)
        if (not order.partner_id.commercial_partner_id.vat
                and self.journal_id.round_payment):
            self.amount = round(self.amount * 20) / 20
        else:
            self.amount = order.amount_total - order.amount_paid

    @api.multi
    def check(self):
        """Check the order:
        if the order is not paid: continue payment,
        if the order is paid print ticket.
        """
        active_id = self.env.context.get('active_id', False)
        order = self.env['pos.order'].browse(active_id)

        amount = order.amount_total - order.amount_paid
        if self.journal_id.round_payment:
            amount = round(amount * 20) / 20

        if amount != 0.0:
            data = self.read()[0]
            data['journal'] = data['journal_id'][0]
            self.pool['pos.order'].add_payment(self._cr, self._uid, active_id, data, self._context)

        if order.test_paid():
            order.signal_workflow('paid')
            return self.print_report()

        return self.launch_payment()
