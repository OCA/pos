# -*- coding: utf-8 -*-
# Copyright 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    pos_payment_globalization = fields.Boolean()
    pos_payment_globalization_account = fields.Many2one(
        comodel_name='account.account')
    pos_payment_globalization_journal = fields.Many2one(
        comodel_name='account.journal')
