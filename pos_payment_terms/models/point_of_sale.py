import time
from datetime import datetime

from openerp import fields, models, api
from openerp.tools import float_is_zero
from openerp.tools.translate import _


class pos_order(models.Model):
    _inherit = "pos.order"

    @api.cr_uid_ids_context
    def _process_order(self, cr, uid, order, context=None):
        session = self.pool.get('pos.session').browse(cr, uid, order['pos_session_id'], context=context)

        if session.state == 'closing_control' or session.state == 'closed':
            session_id = self._get_valid_session(cr, uid, order, context=context)
            session = self.pool.get('pos.session').browse(cr, uid, session_id, context=context)
            order['pos_session_id'] = session_id

        result = []
        payment_terms = self.pool.get('account.payment.term')
        result = payment_terms.compute(
            cr, uid, int(order["payment_terms_id"]), order["amount_total"],
            context=context
        )
        order_id = self.create(cr, uid, self._order_fields(cr, uid, order, context=context),context)
        journal_ids = set()
        for payments in order['statement_ids']:
            for parcel in result:
                payments[2]["name"] = parcel[0]
                payments[2]["amount"] = parcel[1]

                payment_id = self.add_payment(cr, uid, order_id, self._payment_fields(cr, uid, payments[2], context=context), context=context)
                payment = self.pool.get('account.bank.statement.line').browse(cr, uid, payment_id, context=context)
                for journal_line in payment.statement_id.line_ids:
                    if journal_line.credit == parcel[1]:
                        journal_line.write({'date_maturity': parcel[0]})
                    journal_ids.add(payments[2]['journal_id'])

        if session.sequence_number <= order['sequence_number']:
            session.write({'sequence_number': order['sequence_number'] + 1})
            session.refresh()

        if not float_is_zero(order['amount_return'], self.pool.get('decimal.precision').precision_get(cr, uid, 'Account')):
            cash_journal = session.cash_journal_id.id
            if not cash_journal:
                # Select for change one of the cash journals used in this payment
                cash_journal_ids = self.pool['account.journal'].search(cr, uid, [
                    ('type', '=', 'cash'),
                    ('id', 'in', list(journal_ids)),
                ], limit=1, context=context)
                if not cash_journal_ids:
                    # If none, select for change one of the cash journals of the POS
                    # This is used for example when a customer pays by credit card
                    # an amount higher than total amount of the order and gets cash back
                    cash_journal_ids = [statement.journal_id.id for statement in session.statement_ids
                                        if statement.journal_id.type == 'cash']
                    if not cash_journal_ids:
                        teste = ""
                        # raise osv.except_osv( _('error!'),
                        #     _("No cash statement found for this session. Unable to record returned cash."))
                cash_journal = cash_journal_ids[0]
            self.add_payment(cr, uid, order_id, {
                'amount': -order['amount_return'],
                'payment_date': time.strftime('%Y-%m-%d %H:%M:%S'),
                'payment_name': _('return'),
                'journal': cash_journal,
            }, context=context)
        return order_id