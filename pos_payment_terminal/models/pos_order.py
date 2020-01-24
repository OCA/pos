# © 2018 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from collections import defaultdict
import logging

from odoo import api, models

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def _match_transactions_to_payments(self, pos_order):
        payments = pos_order['statement_ids']
        transactions = pos_order['transactions']
        pos_session = self.env['pos.session'].browse(
            pos_order['pos_session_id'])
        currency_digits = pos_session.currency_id.decimal_places
        card_journals = self.env['account.journal'].search([
            ('id', 'in', [p[2]['journal_id'] for p in payments]),
            ('pos_terminal_payment_mode', '!=', False),
        ])
        card_payments = [record[2] for record in payments
                         if record[2]['journal_id'] in card_journals.ids]

        def amount_cents(obj):
            if 'amount_cents' in obj:
                return obj['amount_cents']
            else:
                return int(round(obj['amount'] * pow(10, currency_digits)))

        try:
            for payment, transaction in match(card_payments, transactions,
                                              key=amount_cents):
                payment['note'] = transaction['reference']
        except ValueError as e:
            _logger.error("Error matching transactions to payments: %s",
                          e.args[0])

    def _process_order(self, pos_order):
        if pos_order.get('transactions'):
            self._match_transactions_to_payments(pos_order)
        return super(PosOrder, self)._process_order(pos_order)


def group_by(lists, key):
    count = range(len(lists))
    d = defaultdict(lambda: tuple([[] for _ in count]))
    for i, objects in enumerate(lists):
        for obj in objects:
            d[key(obj)][i].append(obj)
    return d


def match(al, bl, key):
    for key, groups in group_by((al, bl), key).items():
        if groups[0] and len(groups[0]) != len(groups[1]):
            raise ValueError("Missing value for {!r}".format(key))
        for val in zip(*groups):
            yield val
