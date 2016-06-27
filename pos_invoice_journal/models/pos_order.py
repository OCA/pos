# -*- coding: utf-8 -*-
# Copyright 2016 Alex Comba - Agile Business Group
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import api, fields, models


class PosOrder(models.Model):

    _inherit = 'pos.order'

    invoice_journal_id = fields.Many2one(
        related='session_id.config_id.invoice_journal_id',
        string='Invoice Journal',
        readonly=True,
        comodel_name='account.journal',
        store=True,
    )

    @api.multi
    def action_invoice(self):
        self.ensure_one()
        res = super(PosOrder, self).action_invoice()
        if 'res_id' in res and res['res_id']:
            invoice_id = res['res_id']
            self.env['account.invoice'].browse(invoice_id).write(
                {'journal_id': self.invoice_journal_id.id or None})
        return res
