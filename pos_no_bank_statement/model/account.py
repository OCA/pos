# -*- coding: utf-8 -*-
# This file is part of OpenERP. The COPYRIGHT file at the top level of
# this module contains the full copyright notices and license terms.

from openerp import models, fields


class AccountJournal(models.Model):
    _inherit = "account.journal"

    no_bank_statement = fields.Boolean(
        string="No Bank Statement",
        help="Select if you do not want bank statements created. It basically "
        "makes this a dummy method because it will no longer make any impact on"
        " your accounts. One use case might be when you want to sell products "
        "only by issuing an Invoice without registering any payments.")
