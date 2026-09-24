from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestPosTransferAccount(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Create suspense account
        cls.suspense_account = cls.env["account.account"].create(
            {
                "name": "Suspense Account Test",
                "code": "123456",
                "account_type": "asset_current",
            }
        )

        # Create cash journal first (required by payment method)
        cash_journal = cls.env["account.journal"].create(
            {
                "name": "POS Cash",
                "code": "POSC",
                "type": "cash",
                "company_id": cls.env.company.id,
            }
        )

        # Create cash payment method for POS
        cls.cash_method = cls.env["pos.payment.method"].create(
            {
                "name": "Cash",
                "type": "cash",
                "journal_id": cash_journal.id,
                "company_id": cls.env.company.id,
            }
        )

        # Now create POS config including the cash method
        cls.pos_config = cls.env["pos.config"].create(
            {
                "name": "Test POS",
                "suspense_account_id": cls.suspense_account.id,
                "payment_method_ids": [(6, 0, [cls.cash_method.id])],
            }
        )

        # Open session
        cls.session = cls.env["pos.session"].create(
            {
                "config_id": cls.pos_config.id,
            }
        )
        cls.session.action_pos_session_open()

    def test_suspense_account_used_in_cash_in(self):
        # Perform cash in
        cash_in_amount = 789
        extras = {
            "translatedType": "in",
        }
        self.session.try_cash_in_out(
            "in",
            cash_in_amount,
            "Test Cash In",
            extras,
        )
        self.session.action_pos_session_close()
        # Check the account.move.line for the cash in
        aml = self.env["account.move.line"].search(
            [
                ("credit", "=", cash_in_amount),
                ("account_id", "=", self.suspense_account.id),
            ]
        )
        self.assertTrue(aml, "Suspense account should be used in cash in operation")

    def test_suspense_account_used_in_cash_out(self):
        # Perform cash out
        cash_out_amount = 456
        extras = {
            "translatedType": "out",
        }
        self.session.try_cash_in_out(
            "out",
            cash_out_amount,
            "Test Cash Out",
            extras,
        )
        self.session.action_pos_session_close()
        # Check the account.move.line for the cash out
        aml = self.env["account.move.line"].search(
            [
                ("debit", "=", cash_out_amount),
                ("account_id", "=", self.suspense_account.id),
            ]
        )
        self.assertTrue(aml, "Suspense account should be used in cash out operation")
