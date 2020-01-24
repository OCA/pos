# Copyright (C) 2018-TODAY ACSONE SA/NV (<https://www.acsone.eu>).
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


class TestTransactions(TestPointOfSaleCommon):

    def test_matching(self):
        card_journal_id = self.env['account.journal'].create({
            'name': 'Card Journal',
            'code': 'CARD',
            'type': 'bank',
            'pos_terminal_payment_mode': 'card',
        }).id
        cash_journal_id = 0
        pos_order = {
            'pos_session_id': self.pos_order_session0.id,
            'statement_ids': [
                (0, 0, {
                    'name': 'Payment1',
                    'amount': 45.2,
                    'journal_id': card_journal_id,
                }),
                (0, 0, {
                    'name': 'Payment2',
                    'amount': 10.5,
                    'journal_id': card_journal_id,
                }),
                (0, 0, {
                    'name': 'Payment3',
                    'amount': 22.0,
                    'journal_id': cash_journal_id,
                }),
            ],
            'transactions': [
                {
                    'reference': 'ABCDE',
                    'amount_cents': 1050,
                },
                {
                    'reference': 'XPTO',
                    'amount_cents': 4520,
                },
            ]
        }
        self.env['pos.order']._match_transactions_to_payments(pos_order)
        self.assertEquals(pos_order['statement_ids'][0][2]['note'], 'XPTO')
        self.assertEquals(pos_order['statement_ids'][1][2]['note'], 'ABCDE')
