from odoo.exceptions import UserError
from odoo.tests import tagged

from .common import TestPosPaymentMethodFeeCommon


@tagged("post_install", "-at_install")
class TestPosPaymentMethodFeeGrouping(TestPosPaymentMethodFeeCommon):
    """`fee_grouping_policy` field on `pos.payment.method`."""

    def test_grouping_policy_can_be_set_to_detailed(self):
        method = self.env["pos.payment.method"].create(
            {
                "name": "Cash Test",
                "journal_id": self.bank_journal.id,
                "fee_grouping_policy": "detailed",
            }
        )
        self.assertEqual(method.fee_grouping_policy, "detailed")


@tagged("post_install", "-at_install")
class TestPosPaymentMethodWriteForbidden(TestPosPaymentMethodFeeCommon):
    """`_is_write_forbidden` override: fee fields stay editable even while
    the payment method has open POS sessions, everything else stays
    protected."""

    def test_writing_fee_grouping_policy_allowed_with_open_session(self):
        self.payment_method.write({"fee_grouping_policy": "detailed"})
        self.assertEqual(self.payment_method.fee_grouping_policy, "detailed")

    def test_writing_fee_ids_allowed_with_open_session(self):
        self.payment_method.write(
            {
                "fee_ids": [
                    (
                        0,
                        0,
                        {
                            "name": "New Fee",
                            "fee_type": "fixed",
                            "amount": 1.0,
                            "account_id": self.fee_expense_account.id,
                            "counterpart_account_id": self.counterpart_account.id,
                            "journal_id": self.misc_journal.id,
                        },
                    )
                ]
            }
        )
        self.assertTrue(self.payment_method.fee_ids)

    def test_writing_other_fields_still_forbidden_with_open_session(self):
        with self.assertRaises(UserError):
            self.payment_method.write({"name": "Renamed Visa"})

    def test_writing_other_fields_allowed_without_open_session(self):
        method = self.env["pos.payment.method"].create(
            {
                "name": "Unlinked Method",
                "journal_id": self.bank_journal.id,
            }
        )
        self.assertFalse(method.open_session_ids)
        method.write({"name": "Renamed Unlinked"})
        self.assertEqual(method.name, "Renamed Unlinked")

    def test_is_write_forbidden_direct_call(self):
        self.assertFalse(self.payment_method._is_write_forbidden({"fee_ids"}))
        self.assertFalse(
            self.payment_method._is_write_forbidden({"fee_grouping_policy"})
        )
        self.assertFalse(
            self.payment_method._is_write_forbidden({"fee_ids", "fee_grouping_policy"})
        )

        self.assertTrue(self.payment_method._is_write_forbidden({"name", "fee_ids"}))

        self.assertTrue(self.payment_method._is_write_forbidden({"name"}))
