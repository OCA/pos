# Copyright 2020 ForgeFlow, S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError


class TestPosStatementClosingBalance(TransactionCase):
    def setUp(self):
        super(TestPosStatementClosingBalance, self).setUp()
        self.pos_config = self.env["pos.config"].create({"name": "PoS config"})
        self.wizard_reason = self.env['wizard.pos.move.reason']
        account = self.env['account.account'].create({
            'code': '9999',
            'name': 'Test',
            'user_type_id': self.env.ref(
                "account.data_account_type_liquidity").id
        })
        self.bank_journal = self.env["account.journal"].create({
            "name": "Test bank",
            "code": "TB1",
            "type": "bank",
            "pos_control_ending_balance": True,
        })
        self.pos_move_reason = self.env['pos.move.reason'].create({
            'name': 'Bank closing reason',
            'is_income_reason': True,
            'is_expense_reason': True,
            'expense_account_id': account.id,
            'income_account_id': account.id,
            'journal_ids': self.bank_journal.ids,
            'company_id': self.env.ref('base.main_company').id,
        })
        self.bank_journal.pos_move_reason_id = self.pos_move_reason
        self.pos_config.journal_ids += self.bank_journal
        self.pos_config.open_session_cb()
        self.session = self.pos_config.current_session_id
        self.session.action_pos_session_open()

    def test_wizard(self):
        journal = self.session.journal_ids.filtered(lambda j: j.code == 'TB1')
        wizard = self.wizard_reason.with_context(
            active_id=self.session.id,
            default_move_type='income').create({
                'move_reason_id': self.pos_move_reason.id,
                'journal_id': self.bank_journal.id,
                'statement_id': self.session.statement_ids.filtered(
                    lambda s: s.journal_id == self.bank_journal).id,
                'amount': 10,
                'name': 'Test Bank Deposit',
            })
        wizard.apply()
        self.assertEqual(
            self.session.statement_ids.filtered(
                lambda r: r.journal_id.id == journal.id
            ).difference,
            -10.0,
        )
        with self.assertRaises(ValidationError):
            self.session.action_pos_session_closing_control()

        wizard = (
            self.env["pos.update.bank.statement.closing.balance"]
            .with_context(
                active_model="pos.session", active_ids=self.session.ids
            )
            .create({})
        )
        for item in wizard.item_ids:
            item.balance_end_real = 2.0
        wizard.action_confirm()
        self.assertEqual(
            self.session.statement_ids.filtered(
                lambda r: r.journal_id.id == journal.id
            ).balance_end,
            2.0,
        )
        self.assertEqual(
            self.session.statement_ids.filtered(
                lambda r: r.journal_id.id == journal.id
            ).difference,
            0,
        )
        self.session.action_pos_session_closing_control()
        self.assertEqual(self.session.state, 'closed')
