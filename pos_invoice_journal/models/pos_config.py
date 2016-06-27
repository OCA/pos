# -*- coding: utf-8 -*-
# Copyright 2016 Alex Comba - Agile Business Group
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import api, fields, models


class PosConfig(models.Model):

    _inherit = 'pos.config'

    @api.model
    def _default_invoice_journal(self):
        company_id = self._context.get(
            'company_id', self.env.user.company_id.id)
        domain = [
            ('type', '=', 'sale'),
            ('company_id', '=', company_id),
        ]
        return self.env['account.journal'].search(domain, limit=1)

    invoice_journal_id = fields.Many2one(
        string='Invoice Journal',
        help='When choosing to invoice the pos order, this is the '
             'Accounting Journal used to post sales entries.',
        comodel_name='account.journal',
        domain=[('type', '=', 'sale')],
        default=_default_invoice_journal,
    )
