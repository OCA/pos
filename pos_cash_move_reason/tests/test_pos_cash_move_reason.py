# -*- coding: utf-8 -*-
# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests import common


class TestPosCashMoveReason(common.TransactionCase):

    def setUp(self):
        super(TestPosCashMoveReason, self).setUp()
        self.pos_session_obj = self.env['pos.session']
        self.aml_obj = self.env['account.move.line']
        self.cash_in_obj = self.env['cash.box.in']
        self.cash_out_obj = self.env['cash.box.out']
        self.cash_move_reason_obj = self.env['product.template']
        self.main_config = self.env.ref('point_of_sale.pos_config_main')
        self.cash_journal = self.env.ref('account.cash_journal')
        self.income_account = self.env.ref('account.o_income')
        self.expense_account = self.env.ref('account.a_expense')

    def test01(self):
        # I create one move reason
        vals = {'name': 'Miscellaneous income',
                'property_account_income': self.income_account.id,
                'income_pdt': True}
        move_reason = self.cash_move_reason_obj.create(vals)
        # I set cash control on cash journal
        self.cash_journal.cash_control = True
        # I create and open a new session
        self.session_01 = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        ctx = self.env.context.copy()
        # context is updated in open_cb
        # -> Need to call with old api to give unfrozen context
        self.registry['pos.session'].open_cb(
            self.cr, self.uid, [self.session_01.id], context=ctx)
        ctx['active_ids'] = self.session_01.id
        ctx['active_model'] = self.session_01._name
        # I put the session in validation control
        self.session_01.signal_workflow('cashbox_control')
        ctx['active_ids'] = self.session_01.id
        ctx['active_model'] = self.session_01._name
        # I create a cash in
        cash_in = self.cash_in_obj.with_context(ctx).create(
            {'name': 'Initialization',
             'product_id': move_reason.id,
             'amount': 500.0})
        cash_in.with_context(ctx).run()
        # I close the session
        self.session_01.signal_workflow('close')
        # I get the statement from the session
        statement = self.env['account.bank.statement'].search(
            [('pos_session_id', '=', self.session_01.id),
             ('journal_id', '=', self.cash_journal.id)])
        # I get all move lines of this statement
        move_line_ids = statement.move_line_ids.ids
        move_line = self.env['account.move.line'].search(
            [('account_id', '=', self.income_account.id),
             ('credit', '=', 500.0),
             ('id', 'in', move_line_ids)])
        # I check the created move line from the cash in
        self.assertEquals(len(move_line.ids), 1)

    def test02(self):
        # I create one move reason
        vals = {'name': 'Miscellaneous expense',
                'property_account_expense': self.expense_account.id,
                'expense_pdt': True}
        move_reason = self.cash_move_reason_obj.create(vals)
        # I set cash control on cash journal
        self.cash_journal.cash_control = True
        # I create and open a new session
        self.session_01 = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        ctx = self.env.context.copy()
        # context is updated in open_cb
        # -> Need to call with old api to give unfrozen context
        self.registry['pos.session'].open_cb(
            self.cr, self.uid, [self.session_01.id], context=ctx)
        ctx['active_ids'] = self.session_01.id
        ctx['active_model'] = self.session_01._name
        # I put the session in validation control
        self.session_01.signal_workflow('cashbox_control')
        ctx['active_ids'] = self.session_01.id
        ctx['active_model'] = self.session_01._name
        # I create a cash out
        cash_out = self.cash_out_obj.with_context(ctx).create(
            {'name': 'Miscellaneous expense',
             'product_id': move_reason.id,
             'amount': 500.0})
        cash_out.with_context(ctx).run()
        # I close the session
        self.session_01.signal_workflow('close')
        # I get the statement from the session
        statement = self.env['account.bank.statement'].search(
            [('pos_session_id', '=', self.session_01.id),
             ('journal_id', '=', self.cash_journal.id)])
        # I get all move lines of this statement
        move_line_ids = statement.move_line_ids.ids
        move_line = self.env['account.move.line'].search(
            [('account_id', '=', self.expense_account.id),
             ('debit', '=', 500.0),
             ('id', 'in', move_line_ids)])
        # I check the created move line from the cash in
        self.assertEquals(len(move_line.ids), 1)
