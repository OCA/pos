from datetime import datetime

from odoo.exceptions import UserError
from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install")
class TestPosMultiOrderPayment(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.cash_journal = cls.env["account.journal"].create(
            {
                "name": "Cash Test",
                "type": "cash",
                "code": "TCSH",
                "company_id": cls.env.company.id,
            }
        )

        cls.pos_config = cls.env["pos.config"].create(
            {
                "name": "Test POS",
            }
        )

        cls.cash_payment_method = cls.env["pos.payment.method"].create(
            {
                "name": "Cash",
                "is_cash_count": True,
                "journal_id": cls.cash_journal.id,
                "receivable_account_id": cls.env["account.account"]
                .create(
                    {
                        "name": "Test Receivable Account",
                        "code": "TEST.RCV",
                        "account_type": "asset_receivable",
                        "reconcile": True,
                    }
                )
                .id,
            }
        )

        cls.pos_config.write(
            {
                "payment_method_ids": [(4, cls.cash_payment_method.id)],
                "journal_id": cls.cash_journal.id,
            }
        )

        cls.product = cls.env["product.product"].create(
            {
                "name": "Test Product",
                "type": "product",
                "list_price": 100,
                "available_in_pos": True,
                "taxes_id": False,
            }
        )

        cls.pos_config.open_ui()
        cls.pos_session = cls.pos_config.current_session_id

    def _create_pos_order(self, amount):
        """Helper method to create a POS order"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        pos_reference = f"Order {timestamp}-123-1234"

        return self.env["pos.order"].create(
            {
                "company_id": self.env.company.id,
                "session_id": self.pos_session.id,
                "amount_tax": 0.0,
                "amount_total": amount,
                "amount_paid": 0.0,
                "amount_return": 0.0,
                "pos_reference": pos_reference,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "product_id": self.product.id,
                            "qty": 1,
                            "price_unit": amount,
                            "price_subtotal": amount,
                            "price_subtotal_incl": amount,
                        },
                    )
                ],
            }
        )

    def test_process_payment_lines_with_payment_order(self):
        """Test processing payment lines with a payment order reference"""
        order1 = self._create_pos_order(100)
        order2 = self._create_pos_order(50)
        pos_order_data = {
            "amount_paid": 0,
            "amount_total": 50,
            "amount_tax": 0,
            "amount_return": 0,
            "lines": [],
            "payment_order_id": order1.id,
            "statement_ids": [],
        }

        order2._process_payment_lines(
            pos_order_data,
            order2,
            self.pos_session,
            False,
        )

        self.assertEqual(
            order2.payment_order_id.id,
            order1.id,
            "Payment order reference not properly set",
        )

        self.assertTrue(
            order2.payment_ids,
            "No payment created for the order",
        )
        self.assertEqual(
            order2.payment_ids[0].amount,
            50,
            "Payment amount is incorrect",
        )

    def test_process_payment_lines_without_cash_method(self):
        """Test processing payment lines without cash payment method"""
        pos_config_without_payment = self.env["pos.config"].create(
            {
                "name": "Test POS Without Payment",
            }
        )

        pos_session_without_payment = self.env["pos.session"].create(
            {
                "user_id": self.env.uid,
                "config_id": pos_config_without_payment.id,
            }
        )
        pos_session_without_payment.action_pos_session_open()

        order1 = self._create_pos_order(100)
        order2 = self._create_pos_order(50)

        pos_order_data = {
            "amount_paid": 0,
            "amount_total": 50,
            "amount_tax": 0,
            "amount_return": 0,
            "lines": [],
            "payment_order_id": order1.id,
            "statement_ids": [],
        }

        with self.assertRaises(UserError):
            order2._process_payment_lines(
                pos_order_data,
                order2,
                pos_session_without_payment,
                False,
            )

    def test_export_for_ui(self):
        """Test the UI export method"""
        order1 = self._create_pos_order(100)
        order2 = self._create_pos_order(50)

        order2.write({"payment_order_id": order1.id})

        ui_data = order2._export_for_ui(order2)
        self.assertEqual(
            ui_data["payment_order_id"],
            order1.id,
            "Payment order ID not properly exported to UI",
        )
