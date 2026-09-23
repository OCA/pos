from odoo import Command
from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install")
class TestPosPaymentCreditAutoApply(TransactionCase):
    """Test the auto-apply credit amount functionality"""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.PosOrder = cls.env["pos.order"]
        cls.cash_account = cls.env["account.account"].create(
            {
                "name": "Cash Account Test Auto",
                "code": "CHTA001",
                "account_type": "asset_cash",
            }
        )
        cls.bank_account = cls.env["account.account"].create(
            {
                "name": "Bank Account Test Auto",
                "code": "BNKA01",
                "account_type": "asset_cash",
            }
        )
        cls.cash_journal = cls.env["account.journal"].create(
            {
                "name": "Cash Journal Test Auto",
                "code": "CHTA01",
                "type": "cash",
                "default_account_id": cls.cash_account.id,
            }
        )
        cls.bank_journal = cls.env["account.journal"].create(
            {
                "name": "Bank Journal Test Auto",
                "code": "BNKA01",
                "type": "bank",
                "default_account_id": cls.bank_account.id,
            }
        )
        # Create POS config
        cls.pos_config = cls.env["pos.config"].create(
            {
                "name": "POS Test Config Auto",
                "journal_id": cls.cash_journal.id,
            }
        )
        cls.cash_method = cls.env["pos.payment.method"].create(
            {
                "name": "Cash Payment Method Test Auto",
                "journal_id": cls.cash_journal.id,
            }
        )
        # Create auto-apply credit payment method
        cls.auto_credit_method = cls.env["pos.payment.method"].create(
            {
                "name": "Auto Credit Payment Method",
                "journal_id": cls.bank_journal.id,
                "payment_method_type": "terminal",
                "use_payment_terminal": "credit",
                "auto_apply_credit_amount": True,
            }
        )
        # Create manual credit payment method
        cls.manual_credit_method = cls.env["pos.payment.method"].create(
            {
                "name": "Manual Credit Payment Method",
                "journal_id": cls.bank_journal.id,
                "payment_method_type": "terminal",
                "use_payment_terminal": "credit",
                "auto_apply_credit_amount": False,
            }
        )
        cls.pos_config.write(
            {
                "payment_method_ids": [
                    Command.set(
                        [
                            cls.cash_method.id,
                            cls.auto_credit_method.id,
                            cls.manual_credit_method.id,
                        ]
                    )
                ]
            }
        )
        # Create product
        cls.product = cls.env["product.product"].create(
            {
                "name": "Test Product Auto",
                "type": "consu",
                "list_price": 100.0,
                "available_in_pos": True,
            }
        )
        # Create partner with credit
        cls.partner = cls.env["res.partner"].create(
            {"name": "Test Customer Auto", "credit_amount": 500.0}
        )

    def test_auto_apply_field_exists(self):
        """Test that auto_apply_credit_amount field exists and works"""
        self.assertTrue(hasattr(self.auto_credit_method, "auto_apply_credit_amount"))
        self.assertTrue(self.auto_credit_method.auto_apply_credit_amount)
        self.assertFalse(self.manual_credit_method.auto_apply_credit_amount)

    def test_auto_apply_loaded_in_pos(self):
        """Test that auto_apply field is loaded in POS data"""
        fields = self.auto_credit_method._load_pos_data_fields(self.pos_config.id)
        self.assertIn("auto_apply_credit_amount", fields)

    def test_payment_with_auto_apply_method(self):
        """Test payment with auto-apply credit method"""
        initial_credit = self.partner.credit_amount
        order_amount = 120.0

        # Open session and create order
        self.pos_config.open_ui()
        pos_order = self.PosOrder.create(
            {
                "session_id": self.pos_config.current_session_id.id,
                "partner_id": self.partner.id,
                "lines": [
                    Command.create(
                        {
                            "product_id": self.product.id,
                            "price_unit": order_amount,
                            "qty": 1,
                            "tax_ids": [],
                            "price_subtotal": order_amount,
                            "price_subtotal_incl": order_amount,
                        }
                    ),
                ],
                "amount_total": order_amount,
                "amount_tax": 0.0,
                "amount_paid": order_amount,
                "amount_return": 0.0,
            }
        )

        # Make payment with auto-apply credit method
        context_make_payment = {
            "active_ids": pos_order.ids,
            "active_id": pos_order.id,
        }
        pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(**context_make_payment)
            .create(
                {
                    "amount": order_amount,
                    "payment_method_id": self.auto_credit_method.id,
                }
            )
        )
        pos_make_payment.with_context(**context_make_payment).check()

        # Verify credit was deducted
        self.assertEqual(
            self.partner.credit_amount,
            initial_credit - order_amount,
            "Credit should be deducted with auto-apply method",
        )

    def test_partial_auto_apply(self):
        """Test auto-apply with credit less than order amount"""
        # Set partner credit lower than order amount
        self.partner.credit_amount = 50.0

        # In real auto-apply scenario, only $50 would be auto-applied
        # The remaining $100 would need another payment method
        # This test verifies the logic can handle partial credit

        result = self.auto_credit_method.pos_payment_credit_payment(
            partner_id=self.partner.id, amount=50.0, order_id="TEST-PARTIAL"
        )

        self.assertEqual(result["status"], "success")
        self.assertEqual(self.partner.credit_amount, 0.0)

    def test_manual_vs_auto_credit_methods(self):
        """Test that manual and auto methods behave correctly"""
        # Both should deduct credit when used
        initial_credit = self.partner.credit_amount

        # Use manual method
        result_manual = self.manual_credit_method.pos_payment_credit_payment(
            partner_id=self.partner.id, amount=100.0
        )
        self.assertEqual(result_manual["status"], "success")

        # Use auto method
        result_auto = self.auto_credit_method.pos_payment_credit_payment(
            partner_id=self.partner.id, amount=100.0
        )
        self.assertEqual(result_auto["status"], "success")

        # Total deduction should be 200
        self.assertEqual(self.partner.credit_amount, initial_credit - 200.0)
