# -*- coding: utf-8 -*-
# Copyright 2019 Jacques-Etienne Baudoux (BCIM sprl) <je@bcim.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import models, fields


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    round_payment = fields.Boolean('Round Payment to 5 cents')
