# -*- coding: utf-8 -*-
# (c) 2016 Kmee - Fernando Marcato
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from openerp import models, fields


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    payment_term_ids = fields.Many2many('account.payment.term')
