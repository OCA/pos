# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (<http://kmee.com.br>).
#   Luiz Felipe do Divino <luiz.divino@kmee.com.br>
#   Luis Felipe Mileo <mileo@kmee.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, api


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.cr_uid_ids_context
    def _payment_fields(self, cr, uid, ui_paymentline, context=None):

        result = super(PosOrder, self)._payment_fields(
            cr, uid, ui_paymentline, context
        )
        result['payment_term'] = ui_paymentline.get('payment_term', False)
        return result

    @api.cr_uid_ids_context
    def add_payment(self, cr, uid, order_id, data, context=None):

        if data.get('payment_term'):
            payment_terms = self.pool.get('account.payment.term')
            date_payment = data['payment_date'].split(" ")
            compute = payment_terms.compute(
                cr,
                uid,
                int(data['payment_term']),
                data['amount'],
                date_payment[0],
                context=context
            )
            result = []
            for item in compute:
                data['amount'] = item[1]
                data['payment_date'] = item[0]
                result.append(
                    super(PosOrder, self).add_payment(
                        cr,
                        uid,
                        order_id,
                        data,
                        context=None
                    )
                )
            return result

        return super(PosOrder, self).add_payment(
            cr, uid, order_id, data, context=None
        )
