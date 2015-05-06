# -*- coding: utf-8 -*-
# This file is part of OpenERP. The COPYRIGHT file at the top level of
# this module contains the full copyright notices and license terms.

from openerp import models, api


class POSOrder(models.Model):
    _inherit = "pos.order"

    @api.v7
    def add_payment(self, cr, uid, order_id, data, context=None):
        journal_id = data.get('journal')
        if journal_id:
            journal_rec = self.pool.get('account.journal').browse(
                cr, uid, journal_id, context)
            if journal_rec.no_bank_statement:
                return None

        return super(POSOrder, self).add_payment(
            cr, uid, order_id, data, context)
