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
        """

        @param cr:
        @param uid:
        @param ui_paymentline:
        @param context:
        @return:
        """

        result = super(PosOrder, self)._payment_fields(
            cr, uid, ui_paymentline, context
        )
        result['payment_term'] = ui_paymentline.get('payment_term', False)
        return result

    @api.model
    def add_payment(self, order_id, data, **kwargs):
        """

        @param data:
        @return:
        """

        if data.get('payment_term'):
            payment_terms = self.env['account.payment.term']
            ctx = dict(self._context)
            compute = payment_terms.with_context(ctx).compute(
                self.payment_terms_id.id , self.amount_total)
            result = []
            for item in compute:
                result.append(super(PosOrder, self).add_payment(data, context=None))
            return result

        return super(PosOrder, self).add_payment(data, context=None)
