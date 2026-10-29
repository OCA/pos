# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import UserError, ValidationError
from odoo.tests import tagged

from .common import TestMarkPaidCommon


@tagged("post_install", "-at_install")
class TestPosConfigMarkPaid(TestMarkPaidCommon):
    def test_enabled_requires_account_and_label(self):
        with self.assertRaises(ValidationError):
            self.config.mark_paid_account_id = False
        with self.assertRaises(ValidationError):
            self.config.mark_paid_label = False

    def test_account_type_usable_on_invoice(self):
        for account_type in ("asset_receivable", "liability_payable", "off_balance"):
            with self.subTest(account_type=account_type):
                account = self.env["account.account"].create(
                    {
                        "code": "WOFF%s" % account_type[:3].upper(),
                        "name": "Write-off %s" % account_type,
                        "account_type": account_type,
                        "reconcile": account_type != "off_balance",
                    }
                )
                with self.assertRaises(ValidationError):
                    self.config.mark_paid_account_id = account

    def test_limits(self):
        with self.assertRaises(ValidationError):
            self.config.write({"mark_paid_max_percent": 0, "mark_paid_max_amount": 0})
        with self.assertRaises(ValidationError):
            self.config.mark_paid_max_percent = 100.01
        with self.assertRaises(ValidationError):
            self.config.mark_paid_max_percent = -1
        with self.assertRaises(ValidationError):
            self.config.mark_paid_max_amount = -1

    def test_valid_limits(self):
        for percent, amount in ((5.0, 0.0), (0.0, 1.0), (100.0, 1.0)):
            self.config.write(
                {"mark_paid_max_percent": percent, "mark_paid_max_amount": amount}
            )
            self.assertEqual(self.config.mark_paid_max_percent, percent)
            self.assertEqual(self.config.mark_paid_max_amount, amount)

    def test_disabled_needs_nothing(self):
        self.config.write(
            {
                "mark_paid_enabled": False,
                "mark_paid_account_id": False,
                "mark_paid_label": False,
                "mark_paid_max_percent": 0,
                "mark_paid_max_amount": 0,
            }
        )
        self.assertFalse(self.config.mark_paid_enabled)

    def test_locked_while_session_open(self):
        self.open_new_session()
        values = {
            "mark_paid_enabled": False,
            "mark_paid_account_id": self.company_data["default_account_expense"].id,
            "mark_paid_max_percent": 2.0,
            "mark_paid_max_amount": 2.0,
            "mark_paid_label": "Other",
        }
        for field_name, value in values.items():
            with self.assertRaises(UserError):
                self.config.write({field_name: value})
        self._close_session()
        self.config.write(values)
        self.assertEqual(self.config.mark_paid_label, "Other")
