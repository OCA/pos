# -*- coding: utf-8 -*-
# Copyright 2015-2017 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.tests.common import SavepointCase


class TestPosCashMoveReason(SavepointCase):

    @classmethod
    def setUpClass(cls):
        super(TestPosCashMoveReason, cls).setUpClass()
        cls.pos_session_obj = cls.env['pos.session']
        cls.aml_obj = cls.env['account.move.line']
        cls.cash_in_obj = cls.env['cash.box.in']
        cls.cash_out_obj = cls.env['cash.box.out']
        cls.cash_move_reason_obj = cls.env['product.template']
        cls.main_config = cls.env.ref('point_of_sale.pos_config_main')
        cls.account_journal = cls.env['account.journal']
        cls.account_account = cls.env['account.account']

        # MODELS
        cls.account_account_rsa = cls.account_account.create(
            {'code': 'X1113',
             'name': 'Reserve and Profit/Loss - (test)',
             'user_type_id': cls.env.ref(
                 'account.data_account_type_current_liabilities').id})
        cls.account_account_cash = cls.account_account.create(
            {'code': 'X1015',
             'name': 'Cash - (test)',
             'user_type_id': cls.env.ref(
                 'account.data_account_type_liquidity').id})
        cls.income_account = cls.account_account.create(
            {'code': 'X1016',
             'name': 'Opening Income - (test)',
             'user_type_id': cls.env.ref(
                 'account.data_account_type_other_income').id})
        cls.expense_account = cls.account_account.create(
            {'code': 'X2120',
             'name': 'Expenses - (test)',
             'user_type_id': cls.env.ref(
                 'account.data_account_type_expenses').id})
        cls.cash_journal = cls.account_journal.create(
            {'name': 'Cash Journal - (test)',
             'code': 'TCSH',
             'type': 'cash',
             'profit_account_id': cls.account_account_rsa.id,
             'loss_account_id': cls.account_account_rsa.id,
             'default_debit_account_id': cls.account_account_cash.id,
             'default_credit_account_id': cls.account_account_cash.id})

    def test01(self):
        self.main_config.write(
            {'journal_ids': [(6, 0, [self.cash_journal.id])],
             'cash_control': True})
        # Create and open a new session
        self.session = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        self.session.action_pos_session_open()

        # I create one move reason
        vals = {'name': 'Miscellaneous income',
                'property_account_income_id': self.income_account.id,
                'income_pdt': True}
        move_reason = self.cash_move_reason_obj.create(vals)
        # I set cash control on cash journal
        self.cash_journal.cash_control = True

        ctx = self.env.context.copy()
        ctx['active_ids'] = self.session.id
        ctx['active_model'] = self.session._name

        # I put the session in validation control
        self.session.write(
            {'state': 'closing_control', 'stop_at': fields.Datetime.now()})

        # I create a cash in
        cash_in = self.cash_in_obj.with_context(ctx).create(
            {'name': 'Initialization',
             'product_id': move_reason.id,
             'amount': 500.0})
        cash_in.with_context(ctx).run()

        # close session
        self.session.action_pos_session_closing_control()

        # I get the statement from the session
        statement = self.env['account.bank.statement'].search(
            [('pos_session_id', '=', self.session.id),
             ('journal_id', '=', self.cash_journal.id)], limit=1)
        # I get all move lines of this statement
        move_line_ids = statement.move_line_ids.ids
        move_line = self.env['account.move.line'].search(
            [('account_id', '=', self.income_account.id),
             ('credit', '=', 500.0),
             ('id', 'in', move_line_ids)])
        # I check the created move line from the cash in
        self.assertEquals(len(move_line.ids), 1)

    def test02(self):
        self.main_config.write(
            {'journal_ids': [(6, 0, [self.cash_journal.id])],
             'cash_control': True})
        # Create and open a new session
        self.session = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        self.session.action_pos_session_open()

        # I create one move reason
        vals = {'name': 'Miscellaneous expense',
                'property_account_expense_id': self.expense_account.id,
                'expense_pdt': True}
        move_reason = self.cash_move_reason_obj.create(vals)
        # I set cash control on cash journal
        self.cash_journal.cash_control = True

        ctx = self.env.context.copy()
        ctx['active_ids'] = self.session.id
        ctx['active_model'] = self.session._name

        # I put the session in validation control
        self.session.write(
            {'state': 'closing_control', 'stop_at': fields.Datetime.now()})

        # I create a cash out
        cash_out = self.cash_out_obj.with_context(ctx).create(
            {'name': 'Miscellaneous expense',
             'product_id': move_reason.id,
             'amount': 500.0})
        cash_out.with_context(ctx).run()

        # close session
        self.session.action_pos_session_closing_control()
        # I get the statement from the session
        statement = self.env['account.bank.statement'].search(
            [('pos_session_id', '=', self.session.id),
             ('journal_id', '=', self.cash_journal.id)], limit=1)
        # I get all move lines of this statement
        move_line_ids = statement.move_line_ids.ids
        move_line = self.env['account.move.line'].search(
            [('account_id', '=', self.expense_account.id),
             ('debit', '=', 500.0),
             ('id', 'in', move_line_ids)])
        # I check the created move line from the cash in
        self.assertEquals(len(move_line.ids), 1)
