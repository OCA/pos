# Copyright 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import SavepointCase


class TestPosPaymentEntriesGlobalization(SavepointCase):

    @classmethod
    def setUpClass(cls):
        super(TestPosPaymentEntriesGlobalization, cls).setUpClass()

        cls.move_line_obj = cls.env['account.move.line']
        cls.pos_order_obj = cls.env['pos.order']
        cls.main_config = cls.env.ref('point_of_sale.pos_config_main')
        cls.account_type = cls.env['account.account.type']
        cls.account_account = cls.env['account.account']
        cls.payment_method = cls.env['account.journal']
        cls.product_01 = cls.env.ref(
            'point_of_sale.product_product_consumable')
        cls.pos_config = cls.env.ref('point_of_sale.pos_config_main')
        cls.customer_01 = cls.env.ref('base.res_partner_2')
        cls.pos_session_obj = cls.env['pos.session']

        # MODELS
        cls.account_type = cls.account_type.create({
            'name': 'Bank and Cash',
            'type': 'liquidity',
            'include_initial_balance': True
        })
        cls.income_account = cls.account_account.create({
            'code': 'X11006',
            'name': 'Other Income',
            'user_type_id': cls.account_type.id,
        })
        cls.income_account_02 = cls.income_account.copy()
        cls.account_account = cls.account_account.create({
            'code': 'Test X1014',
            'name': 'Bank Current Account - (test)',
            'user_type_id': cls.account_type.id,
            'reconcile': True
        })

        cls.payment_method_02 = cls.payment_method.create({
            'name': 'Bank - Test',
            'code': 'TBNK',
            'type': 'bank',
            'default_debit_account_id': cls.account_account.id,
            'default_credit_account_id': cls.account_account.id
        })

        # next line
        cls.payment_method_03 = cls.payment_method.create({
            'name': 'Checks Journal - (test)',
            'code': 'TBNK',
            'type': 'bank',
            'default_debit_account_id': cls.account_account.id,
            'default_credit_account_id': cls.account_account.id
        })

        cls.misc_journal = cls.payment_method.create({
            'name': 'Miscellaneous Journal - (test)',
            'code': 'TMIS',
            'type': 'general'
        })
        cls.misc_journal_02 = cls.misc_journal.copy()

    def create_order(self, amount, session):
        # I create a new order
        order_vals = {
            'session_id': session.id,
            'partner_id': self.customer_01.id,
            'lines': [(0, 0, {'product_id': self.product_01.id,
                              'price_unit': amount})]
        }
        return self.pos_order_obj.create(order_vals)

    def test_globalization_0(self):
        # add payment method
        self.main_config.write(
            {'journal_ids': [(6, 0, [self.payment_method_02.id])]})
        # Create and open a new session
        self.session = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        self.session.action_pos_session_open()

        # config pos payment globalization
        self.payment_method_02.pos_payment_globalization = True
        self.payment_method_02.pos_payment_globalization_account = \
            self.income_account
        self.payment_method_02.pos_payment_globalization_journal = \
            self.misc_journal

        # I create a new orders
        order_01 = self.create_order(100, self.session)
        order_02 = self.create_order(100, self.session)

        # I pay the created order
        payment_data1 = {'amount': 100,
                         'journal': self.payment_method_02.id,
                         'partner_id': order_01.partner_id.id}
        payment_data2 = {'amount': 100,
                         'journal': self.payment_method_02.id,
                         'partner_id': order_02.partner_id.id}

        # add payment to orders and pay
        order_01.add_payment(payment_data1)
        if order_01.test_paid():
            order_01.action_pos_order_paid()

        order_02.add_payment(payment_data2)
        if order_02.test_paid():
            order_02.action_pos_order_paid()

        # close session
        self.session.action_pos_session_closing_control()

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
            lambda r: not r.reconciled)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)

    def test_globalization_1(self):
        # add payment method
        self.main_config.write(
            {'journal_ids': [(6, 0, [self.payment_method_02.id,
                                     self.payment_method_03.id])]
             })
        # Create and open a new session
        self.session = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        self.session.action_pos_session_open()

        self.payment_method_02.pos_payment_globalization = True
        self.payment_method_02.pos_payment_globalization_account = \
            self.income_account
        self.payment_method_02.pos_payment_globalization_journal = \
            self.misc_journal
        self.payment_method_03.pos_payment_globalization = True
        self.payment_method_03.pos_payment_globalization_account = \
            self.income_account_02
        self.payment_method_03.pos_payment_globalization_journal = \
            self.misc_journal

        # I create a new order
        order_01 = self.create_order(100, self.session)
        order_02 = self.create_order(100, self.session)

        # I pay the created order
        payment_data1 = {'amount': 100,
                         'journal': self.payment_method_02.id,
                         'partner_id': order_01.partner_id.id}
        payment_data2 = {'amount': 100,
                         'journal': self.payment_method_03.id,
                         'partner_id': order_02.partner_id.id}

        # add payment to orders and pay
        order_01.add_payment(payment_data1)
        if order_01.test_paid():
            order_01.action_pos_order_paid()

        order_02.add_payment(payment_data2)
        if order_02.test_paid():
            order_02.action_pos_order_paid()

        # close session
        self.session.action_pos_session_closing_control()

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
            lambda r: not r.reconciled)
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
            lambda r: not r.reconciled)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)

    def test_globalization_2(self):
        # add payment method
        self.main_config.write({'journal_ids': [(6, 0, [
            self.payment_method_02.id, self.payment_method_03.id])]})
        # Create and open a new session
        self.session = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        self.session.action_pos_session_open()

        self.payment_method_02.pos_payment_globalization = True
        self.payment_method_02.pos_payment_globalization_account = \
            self.income_account
        self.payment_method_02.pos_payment_globalization_journal = \
            self.misc_journal
        self.payment_method_03.pos_payment_globalization = True
        self.payment_method_03.pos_payment_globalization_account = \
            self.income_account_02
        self.payment_method_03.pos_payment_globalization_journal = \
            self.misc_journal

        # create orders
        order_01 = self.create_order(100, self.session)
        order_02 = self.create_order(100, self.session)

        # I pay the created order
        payment_data1 = {'amount': 100,
                         'journal': self.payment_method_02.id,
                         'partner_id': order_01.partner_id.id}
        payment_data2 = {'amount': 100,
                         'journal': self.payment_method_03.id,
                         'partner_id': order_02.partner_id.id}

        order_01.add_payment(payment_data1)
        if order_01.test_paid():
            order_01.action_pos_order_paid()

        order_02.add_payment(payment_data2)
        if order_02.test_paid():
            order_02.action_pos_order_paid()

        # close session
        self.session.action_pos_session_closing_control()

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
            lambda r: not r.reconciled)
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
            lambda r: not r.reconciled)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)

    def test_globalization_3(self):
        # add payment method
        self.main_config.write(
            {'journal_ids': [(6, 0, [self.payment_method_02.id,
                                     self.payment_method_03.id])]})
        # Create and open a new session
        self.session = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        self.session.action_pos_session_open()

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

        # I create orders
        order_01 = self.create_order(100, self.session)
        order_02 = self.create_order(100, self.session)

        # I pay the created orders
        payment_data1 = {'amount': 100,
                         'journal': self.payment_method_02.id,
                         'partner_id': order_02.partner_id.id}
        payment_data2 = {'amount': 100,
                         'journal': self.payment_method_03.id,
                         'partner_id': order_02.partner_id.id}

        order_01.add_payment(payment_data1)
        if order_01.test_paid():
            order_01.action_pos_order_paid()

        order_02.add_payment(payment_data2)
        if order_02.test_paid():
            order_02.action_pos_order_paid()

        # close session
        self.session.action_pos_session_closing_control()

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
            lambda r: not r.reconciled)
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
            lambda r: not r.reconciled)
        self.assertEqual(len(not_reconcile_reverse_lines), 0)
