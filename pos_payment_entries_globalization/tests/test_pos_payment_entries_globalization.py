# -*- coding: utf-8 -*-
# Copyright 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests import common


class TestPosPaymentEntriesGlobalization(common.TransactionCase):

    def setUp(self):
        super(TestPosPaymentEntriesGlobalization, self).setUp()
        self.move_line_obj = self.env['account.move.line']
        self.pos_session_obj = self.env['pos.session']
        self.pos_order_obj = self.env['pos.order']
        self.main_config = self.env.ref('point_of_sale.pos_config_main')
        self.payment_method_01 = self.env.ref('account.cash_journal')
        self.payment_method_02 = self.env.ref('account.bank_journal')
        self.payment_method_02.default_debit_account_id.reconcile = True
        self.payment_method_03 = self.env.ref('account.check_journal')
        self.payment_method_03.default_debit_account_id.reconcile = True
        self.income_account = self.env.ref('account.o_income')
        self.income_account_02 = self.income_account.copy()
        self.misc_journal = self.env.ref('account.miscellaneous_journal')
        self.misc_journal_02 = self.misc_journal.copy()
        self.product_01 = self.env.ref('point_of_sale.perrier_50cl')

    def open_session(self):
        # I create and open a new session
        session = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        ctx = self.env.context.copy()
        # context is updated in open_cb
        # -> Need to call with old api to give unfrozen context
        self.registry['pos.session'].open_cb(
            self.cr, self.uid, [session.id], context=ctx)
        return session

    def create_order(self, amount, session):
        # I create a new order
        order_vals = {
            'session_id': session.id,
            'lines': [(0, 0, {'product_id': self.product_01.id,
                              'price_unit': amount,
                              })]
        }
        return self.pos_order_obj.create(order_vals)

    def test_globalization_0(self):
        session = self.open_session()
        self.payment_method_02.pos_payment_globalization = True
        self.payment_method_02.pos_payment_globalization_account =\
            self.income_account
        self.payment_method_02.pos_payment_globalization_journal =\
            self.misc_journal
        # I create a new order
        order_01 = self.create_order(100, session)
        # I pay the created order
        payment_data = {'amount': 100,
                        'journal': self.payment_method_02.id}
        self.pos_order_obj.add_payment(order_01.id, payment_data)
        if order_01.test_paid():
            order_01.signal_workflow('paid')
        # I create a new order
        order_02 = self.create_order(100, session)
        # I pay the created order
        payment_data = {'amount': 100,
                        'journal': self.payment_method_02.id}
        self.pos_order_obj.add_payment(order_02.id, payment_data)
        if order_02.test_paid():
            order_02.signal_workflow('paid')
        # I close the session
        session.signal_workflow('close')
        move_line = self.move_line_obj.search(
            [('account_id', '=', self.income_account.id),
             ('journal_id', '=', self.misc_journal.id)])
        # I check that there is only one move line
        self.assertEqual(len(move_line.ids), 1)
        self.assertAlmostEqual(move_line.debit, 200, 2)
        domain = [('move_id', '=', move_line.move_id.id),
                  ('id', '!=', move_line.id)]
        reverse_lines = self.move_line_obj.search(domain)
        # I ensure that the move contains reverse lines
        self.assertEqual(len(reverse_lines), 2)
        # I ensure reverse lines are reconciled
        not_reconcile_reverse_lines = reverse_lines.filtered(
            lambda r: not r.reconcile_ref)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)

    def test_globalization_1(self):
        session = self.open_session()
        self.payment_method_02.pos_payment_globalization = True
        self.payment_method_02.pos_payment_globalization_account =\
            self.income_account
        self.payment_method_02.pos_payment_globalization_journal =\
            self.misc_journal
        self.payment_method_03.pos_payment_globalization = True
        self.payment_method_03.pos_payment_globalization_account =\
            self.income_account_02
        self.payment_method_03.pos_payment_globalization_journal =\
            self.misc_journal
        # I create a new order
        order_01 = self.create_order(100, session)
        # I pay the created order
        payment_data = {'amount': 100,
                        'journal': self.payment_method_02.id}
        self.pos_order_obj.add_payment(order_01.id, payment_data)
        if order_01.test_paid():
            order_01.signal_workflow('paid')
        # I create a new order
        order_02 = self.create_order(100, session)
        # I pay the created order
        payment_data = {'amount': 100,
                        'journal': self.payment_method_03.id}
        self.pos_order_obj.add_payment(order_02.id, payment_data)
        if order_02.test_paid():
            order_02.signal_workflow('paid')
        # I close the session
        session.signal_workflow('close')
        # I check the first globalization account
        move_line = self.move_line_obj.search(
            [('account_id', '=', self.income_account.id),
             ('journal_id', '=', self.misc_journal.id)])
        # I check that there is only one move line
        self.assertEqual(len(move_line.ids), 1)
        self.assertAlmostEqual(move_line.debit, 100, 2)
        domain = [('move_id', '=', move_line.move_id.id),
                  ('id', '!=', move_line.id)]
        reverse_lines = self.move_line_obj.search(domain)
        # I ensure that the move contains reverse lines
        self.assertEqual(len(reverse_lines), 1)
        # I ensure reverse lines are reconciled
        not_reconcile_reverse_lines = reverse_lines.filtered(
            lambda r: not r.reconcile_ref)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)
        # I check the second globalization account
        move_line = self.move_line_obj.search(
            [('account_id', '=', self.income_account_02.id),
             ('journal_id', '=', self.misc_journal.id)])
        # I check that there is only one move line
        self.assertEqual(len(move_line.ids), 1)
        self.assertAlmostEqual(move_line.debit, 100, 2)
        domain = [('move_id', '=', move_line.move_id.id),
                  ('id', '!=', move_line.id)]
        reverse_lines = self.move_line_obj.search(domain)
        # I ensure that the move contains reverse lines
        self.assertEqual(len(reverse_lines), 1)
        # I ensure reverse lines are reconciled
        not_reconcile_reverse_lines = reverse_lines.filtered(
            lambda r: not r.reconcile_ref)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)

    def test_globalization_2(self):
        session = self.open_session()
        self.payment_method_02.pos_payment_globalization = True
        self.payment_method_02.pos_payment_globalization_account =\
            self.income_account
        self.payment_method_02.pos_payment_globalization_journal =\
            self.misc_journal
        self.payment_method_03.pos_payment_globalization = True
        self.payment_method_03.pos_payment_globalization_account =\
            self.income_account_02
        self.payment_method_03.pos_payment_globalization_journal =\
            self.misc_journal
        # I create a new order
        order_01 = self.create_order(200, session)
        # I pay the created order
        payment_data = {'amount': 100,
                        'journal': self.payment_method_02.id}
        self.pos_order_obj.add_payment(order_01.id, payment_data)
        payment_data = {'amount': 100,
                        'journal': self.payment_method_03.id}
        self.pos_order_obj.add_payment(order_01.id, payment_data)
        if order_01.test_paid():
            order_01.signal_workflow('paid')
        # I close the session
        session.signal_workflow('close')
        # I check the first globalization account
        move_line = self.move_line_obj.search(
            [('account_id', '=', self.income_account.id),
             ('journal_id', '=', self.misc_journal.id)])
        # I check that there is only one move line
        self.assertEqual(len(move_line.ids), 1)
        self.assertAlmostEqual(move_line.debit, 100, 2)
        domain = [('move_id', '=', move_line.move_id.id),
                  ('id', '!=', move_line.id)]
        reverse_lines = self.move_line_obj.search(domain)
        # I ensure that the move contains reverse lines
        self.assertEqual(len(reverse_lines), 1)
        # I ensure reverse lines are reconciled
        not_reconcile_reverse_lines = reverse_lines.filtered(
            lambda r: not r.reconcile_ref)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)
        # I check the second globalization account
        move_line = self.move_line_obj.search(
            [('account_id', '=', self.income_account_02.id),
             ('journal_id', '=', self.misc_journal.id)])
        # I check that there is only one move line
        self.assertEqual(len(move_line.ids), 1)
        self.assertAlmostEqual(move_line.debit, 100, 2)
        domain = [('move_id', '=', move_line.move_id.id),
                  ('id', '!=', move_line.id)]
        reverse_lines = self.move_line_obj.search(domain)
        # I ensure that the move contains reverse lines
        self.assertEqual(len(reverse_lines), 1)
        # I ensure reverse lines are reconciled
        not_reconcile_reverse_lines = reverse_lines.filtered(
            lambda r: not r.reconcile_ref)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)

    def test_globalization_3(self):
        session = self.open_session()
        self.payment_method_02.pos_payment_globalization = True
        self.payment_method_02.pos_payment_globalization_account =\
            self.income_account
        self.payment_method_02.pos_payment_globalization_journal =\
            self.misc_journal
        self.payment_method_03.pos_payment_globalization = True
        self.payment_method_03.pos_payment_globalization_account =\
            self.income_account
        self.payment_method_03.pos_payment_globalization_journal =\
            self.misc_journal_02
        # I create a new order
        order_01 = self.create_order(100, session)
        # I pay the created order
        payment_data = {'amount': 100,
                        'journal': self.payment_method_02.id}
        self.pos_order_obj.add_payment(order_01.id, payment_data)
        if order_01.test_paid():
            order_01.signal_workflow('paid')
        # I create a new order
        order_02 = self.create_order(100, session)
        # I pay the created order
        payment_data = {'amount': 100,
                        'journal': self.payment_method_03.id}
        self.pos_order_obj.add_payment(order_02.id, payment_data)
        if order_02.test_paid():
            order_02.signal_workflow('paid')
        # I close the session
        session.signal_workflow('close')
        # I check the first globalization journal
        move_line = self.move_line_obj.search(
            [('account_id', '=', self.income_account.id),
             ('journal_id', '=', self.misc_journal.id)])
        # I check that there is only one move line
        self.assertEqual(len(move_line.ids), 1)
        self.assertAlmostEqual(move_line.debit, 100, 2)
        domain = [('move_id', '=', move_line.move_id.id),
                  ('id', '!=', move_line.id)]
        reverse_lines = self.move_line_obj.search(domain)
        # I ensure that the move contains reverse lines
        self.assertEqual(len(reverse_lines), 1)
        # I ensure reverse lines are reconciled
        not_reconcile_reverse_lines = reverse_lines.filtered(
            lambda r: not r.reconcile_ref)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)
        # I check the second globalization journal
        move_line = self.move_line_obj.search(
            [('account_id', '=', self.income_account.id),
             ('journal_id', '=', self.misc_journal_02.id)])
        # I check that there is only one move line
        self.assertEqual(len(move_line.ids), 1)
        self.assertAlmostEqual(move_line.debit, 100, 2)
        domain = [('move_id', '=', move_line.move_id.id),
                  ('id', '!=', move_line.id)]
        reverse_lines = self.move_line_obj.search(domain)
        # I ensure that the move contains reverse lines
        self.assertEqual(len(reverse_lines), 1)
        # I ensure reverse lines are reconciled
        not_reconcile_reverse_lines = reverse_lines.filtered(
            lambda r: not r.reconcile_ref)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)
