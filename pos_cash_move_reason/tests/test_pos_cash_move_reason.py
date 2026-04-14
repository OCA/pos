# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.exceptions import UserError
from odoo.tests.common import Form, TransactionCase

from odoo.addons.mail.tests.common import mail_new_test_user


class TestPosCashMoveReason(TransactionCase):
    """Tests for 'Point of Sale - Change Payment' Module"""

    def setUp(self):
        super().setUp()
        self.PosMoveReason = self.env["pos.move.reason"]
        self.WizardReason = self.env["wizard.pos.move.reason"]
        self.PosPaymentMethod = self.env["pos.payment.method"]

        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()

        self.account_id = self.env.company.account_default_pos_receivable_account_id
        self.cash_journal = self.env.ref("pos_cash_move_reason.account_journal_cash")
        self.gazoline_expense_account = self.env.ref(
            "pos_cash_move_reason.gazoline_expense_account"
        )

        self.bank_payment_method = self.PosPaymentMethod.create(
            {
                "name": "Bank",
                "receivable_account_id": self.account_id.id,
                "journal_id": self.cash_journal.id,
            }
        )

        # Open session and get it
        self.pos_config.write(
            {
                "payment_method_ids": [(4, self.bank_payment_method.id)],
                "journal_id": self.cash_journal.id,
            }
        )
        self.pos_config.open_ui()
        self.session = self.pos_config.current_session_id

        self.user_admin = mail_new_test_user(
            self.env,
            name="Demo POS Manager",
            login="demo_admin",
            email="demo_admin",
            groups="account.group_account_manager,"
            "account.group_account_invoice,point_of_sale.group_pos_user",
        )

        # Demo Pos Move Reason
        self.move_reason_bank_deposit = self.PosMoveReason.create(
            {
                "name": "Bank Deposit Test",
                "is_income_reason": False,
                "is_expense_reason": True,
                "expense_account_id": self.gazoline_expense_account.id,
                "journal_ids": [self.cash_journal.id],
                "company_id": self.pos_config.company_id.id,
            }
        )

    def test_001_create_reason_onchange_expense_reason(self):
        move_reason_form = Form(self.PosMoveReason.with_user(self.user_admin))
        move_reason_form.name = "New Reason"
        move_reason_form.is_expense_reason = True
        move_reason_form.is_income_reason = False

        # Expenses reason need account_id
        with self.assertRaises(AssertionError):
            move_reason_form.save()
        move_reason_form.expense_account_id = self.gazoline_expense_account
        move_reason_form.save()

    def test_002_take_money(self):
        # Take money to put in Bank
        wizard = (
            self.WizardReason.with_user(self.user_admin)
            .with_context(active_id=self.session.id, default_move_type="expense")
            .create(
                {
                    "move_reason_id": self.move_reason_bank_deposit.id,
                    "journal_id": self.cash_journal.id,
                    "session_id": self.session.id,
                    "amount": 500,
                    "name": "Test Bank Deposit",
                }
            )
        )
        wizard.onchange_reason()
        wizard.apply()
        self.session.action_pos_session_closing_control()

        # Get all move lines of this statement
        move_line = self.env["account.move.line"].search(
            [
                ("account_id", "=", self.gazoline_expense_account.id),
                ("debit", "=", 500.0),
                (
                    "move_id",
                    "in",
                    self.session.statement_line_ids.mapped("move_id").ids,
                ),
            ]
        )
        # Check the created move line from the cash in
        self.assertEqual(len(move_line), 1)

    def test_003_take_invalid_amount(self):
        # Enter Invalid money
        with self.assertRaises(UserError):
            self.WizardReason.with_user(self.user_admin).with_context(
                active_id=self.session.id, default_move_type="expense"
            ).create(
                {
                    "move_reason_id": self.move_reason_bank_deposit.id,
                    "journal_id": self.cash_journal.id,
                    "session_id": self.session.id,
                    "amount": -100,
                    "name": "Test Deposit",
                }
            )

    def test_004_button_put_money(self):
        wiz = self.session.button_move_income()
        self.assertEqual(wiz["context"]["default_move_type"], "income")
