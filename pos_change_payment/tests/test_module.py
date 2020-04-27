# coding: utf-8
# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests.common import TransactionCase
from openerp.exceptions import Warning as UserError


class TestModule(TransactionCase):
    """Tests for 'Point of Sale - Change Payment' Module"""

    def setUp(self):
        super(TestModule, self).setUp()
        self.PosSession = self.env['pos.session']
        self.PosOrder = self.env['pos.order']
        self.PosMakePayment = self.env['pos.make.payment']
        self.PosSwitchJournalWizard = self.env['pos.switch.journal.wizard']
        self.PosChangePaymentsWizard = self.env['pos.change.payments.wizard']
        self.PosChangePaymentsWizardLine =\
            self.env['pos.change.payments.wizard.line']
        self.product = self.env.ref('product.product_product_3')
        self.pos_config = self.env.ref('point_of_sale.pos_config_main')
        self.check_journal = self.env.ref('account.check_journal')
        self.cash_journal = self.env.ref('account.cash_journal')

        # create new session and open it
        self.session = self.PosSession.create(
            {'config_id': self.pos_config.id})
        self.session.open_cb()
        self.check_statement = self.session.statement_ids.filtered(
            lambda x: x.journal_id == self.check_journal)
        self.cash_statement = self.session.statement_ids.filtered(
            lambda x: x.journal_id == self.cash_journal)

    def _sale(self, session, journal_1, price_1, journal_2=False, price_2=0.0):
        order = self.PosOrder.create({
            'session_id': session.id,
            'lines': [[0, False, {
                'name': 'OL/0001',
                'product_id': self.product.id,
                'qty': 1.0,
                'price_unit': price_1 + price_2,
            }]],
        })
        payment = self.PosMakePayment.with_context(active_id=order.id).create({
            'journal_id': journal_1.id,
            'amount': price_1,
        })
        payment.with_context(active_id=order.id).check()
        if journal_2:
            payment = self.PosMakePayment.with_context(
                active_id=order.id).create({
                    'journal_id': journal_2.id,
                    'amount': price_2,
                })
        payment.with_context(active_id=order.id).check()
        return order

    # Test Section
    def test_01_pos_switch_journal(self):
        # Make a sale with 100 in cash journal
        order = self._sale(self.session, self.cash_journal, 100)
        statement_line = order.statement_ids[0]

        # Switch to check journal
        wizard = self.PosSwitchJournalWizard.with_context(
            active_id=statement_line.id).create({
                'new_journal_id': self.check_journal.id,
            })
        wizard.button_switch_journal()

        # Check Order
        self.assertEqual(
            len(order.statement_ids.filtered(
                lambda x: x.journal_id == self.cash_journal)), 0,
            "Altered order should not have the original payment journal")

        self.assertEqual(
            len(order.statement_ids.filtered(
                lambda x: x.journal_id == self.check_journal)), 1,
            "Altered order should have the final payment journal")

        # Check Session
        self.assertEqual(
            self.cash_statement.balance_end, 0,
            "Bad recompute of the balance for the old statement")

        self.assertEqual(
            self.check_statement.balance_end, 100,
            "Bad recompute of the balance for the new statement")

    def test_02_pos_change_payment(self):
        # Make a sale with 35 in cash journal and 65 in check
        order = self._sale(
            self.session, self.cash_journal, 35, self.check_journal, 65)

        # Switch to check journal
        wizard = self.PosChangePaymentsWizard.with_context(
            active_id=order.id).create({})
        self.PosChangePaymentsWizardLine.with_context(
            active_id=order.id).create({
                'wizard_id': wizard.id,
                'new_journal_id': self.cash_journal.id,
                'amount': 10,
            })
        self.PosChangePaymentsWizardLine.with_context(
            active_id=order.id).create({
                'wizard_id': wizard.id,
                'new_journal_id': self.check_journal.id,
                'amount': 40,
            })

        with self.assertRaises(UserError):
            # Should not work if total is not correct
            wizard.button_change_payments()

        # Finish payement
        self.PosChangePaymentsWizardLine.with_context(
            active_id=order.id).create({
                'wizard_id': wizard.id,
                'new_journal_id': self.check_journal.id,
                'amount': 50,
            })
        wizard.button_change_payments()

        # check Session
        self.assertEqual(
            self.cash_statement.balance_end, 10,
            "Bad recompute of the balance for the old statement")

        self.assertEqual(
            self.check_statement.balance_end, 90,
            "Bad recompute of the balance for the new statement")

    def test_03_merge_statement(self):
        # Make a sale with multiple cash payement
        order = self._sale(
            self.session, self.cash_journal, 100,
            journal_2=self.cash_journal, price_2=200)
        # Check that statement has been merged
        self.assertEqual(
            len(order.statement_ids), 1,
            "Adding many cash statement for an order should merge them.")

        self.assertEqual(
            order.statement_ids[0].amount, 300,
            "Invalid total amount for merged cash statements")

        # Make a sale with multiple check payement
        order = self._sale(
            self.session, self.check_journal, 100,
            self.check_journal, 200)
        # Check that statement has been merged
        self.assertEqual(
            len(order.statement_ids), 2,
            "Adding many check statement for an order should not merge them.")
