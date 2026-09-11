from odoo.addons.account.tests.common import AccountTestInvoicingCommon


class TestPosPaymentMethodFeeCommon(AccountTestInvoicingCommon):
    """Shared fixtures: accounting accounts, journal, test POS payment
    methods, and an open POS session for orders and payments without UI
    dependency."""

    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)

        cls.fee_expense_account = cls.company_data["default_account_expense"]
        cls.counterpart_account = cls.company_data["default_account_assets"]
        cls.misc_journal = cls.company_data["default_journal_misc"]
        cls.bank_journal = cls.company_data["default_journal_bank"]

        cls.pos_config = cls.env["pos.config"].create(
            {
                "name": "Test Shop - Fees",
            }
        )

        cls.payment_method = cls.env["pos.payment.method"].create(
            {
                "name": "Visa Test",
                "journal_id": cls.bank_journal.id,
                "company_id": cls.env.company.id,
            }
        )

        cls.payment_method_b = cls.env["pos.payment.method"].create(
            {
                "name": "Mastercard Test",
                "journal_id": cls.bank_journal.id,
                "company_id": cls.env.company.id,
            }
        )

        cls.pos_config.write(
            {
                "payment_method_ids": [
                    (4, cls.payment_method.id),
                    (4, cls.payment_method_b.id),
                ],
            }
        )

        cls.pos_session = cls.env["pos.session"].create(
            {
                "config_id": cls.pos_config.id,
            }
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _create_order(self, amount_total=100.0, session=None):
        return self.env["pos.order"].create(
            {
                "session_id": (session or self.pos_session).id,
                "amount_total": amount_total,
                "amount_tax": 0.0,
                "amount_paid": amount_total,
                "amount_return": 0.0,
            }
        )

    def _create_payment(self, order, amount, payment_method=None):
        return self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "payment_method_id": (payment_method or self.payment_method).id,
                "amount": amount,
            }
        )

    def _create_fee_rule(self, **kwargs):
        vals = {
            "name": "Test Fee",
            "payment_method_id": self.payment_method.id,
            "fee_type": "percentage",
            "amount": 1.5,
            "account_id": self.fee_expense_account.id,
            "counterpart_account_id": self.counterpart_account.id,
            "journal_id": self.misc_journal.id,
            "posting_policy": "session_close",
        }
        vals.update(kwargs)
        return self.env["pos.payment.method.fee"].create(vals)

    def _new_fee_rule(self, **overrides):
        # Required fields forbid NULL at DB level, so an in-memory (unsaved)
        # record is used to simulate an incomplete/invalid configuration.
        vals = {
            "name": "Test Fee",
            "payment_method_id": self.payment_method.id,
            "fee_type": "fixed",
            "amount": 1.0,
            "account_id": self.fee_expense_account.id,
            "counterpart_account_id": self.counterpart_account.id,
            "journal_id": self.misc_journal.id,
            "company_id": self.env.company.id,
        }
        vals.update(overrides)
        return self.env["pos.payment.method.fee"].new(vals)

    def _create_draft_fee_line(self, payment, fee_rule, fee_amount, amount_base=100.0):
        # Bypasses the zero-amount skip in `_create_payment_method_fees` so
        # zero/offsetting amounts can be tested directly.
        return self.env["pos.payment.fee.line"].create(
            {
                "payment_id": payment.id,
                "fee_rule_id": fee_rule.id,
                "amount_base": amount_base,
                "fee_amount": fee_amount,
                "session_id": self.pos_session.id,
                "state": "draft",
            }
        )
