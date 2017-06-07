# -*- coding: utf-8 -*-
# This file is part of OpenERP. The COPYRIGHT file at the top level of
# this module contains the full copyright notices and license terms.

from openerp import models, api


class POSOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def add_payment(self, order_id, data):
        journal_id = data.get('journal')
        if journal_id:
            journal = self.env['account.journal'].browse(journal_id)
            if journal.no_bank_statement:
                return None

        return super(POSOrder, self).add_payment(order_id, data)
