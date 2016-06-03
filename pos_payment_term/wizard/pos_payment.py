# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>)
#   Luiz Felipe do Divino <luiz.divino@kmee.com.br>
#   Luis Felipe Mileo <mileo@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, fields, models


class PosMakePayment(models.Model):
    _inherit = "pos.make.payment"

    payment_term_id = fields.Many2one(
        'account.payment.term'
    )

