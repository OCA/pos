# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
# Luiz Felipe do Divino <luiz.divino@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import api, models, fields


class AccountJournalPos(models.Model):
    _inherit = "account.journal"

    pos_payment_card_reconciliation = fields.Boolean("Pos cards reconciliation")
