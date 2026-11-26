from random import randint

from odoo import Command, fields
from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install")
class TestPosPaymentCashChange(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))

        # Use timestamp to ensure unique codes
        timestamp = fields.Datetime.now().strftime("%Y%m%d%H%M%S")

        # Create accounts
        cls.change_account = cls.env["account.account"].create(
            {
                "name": "Cash Receipt Account Test",
                "code": f"TCHNG{timestamp}",
                "account_type": "asset_current",
            }
        )
        cls.cash_account = cls.env["account.account"].create(
            {
                "name": "Cash Account Test",
                "code": f"TCASH{timestamp}",
                "account_type": "asset_cash",
            }
        )

        # Create cash journal with cash receipt account
        cls.cash_journal = cls.env["account.journal"].create(
            {
                "name": "Cash Journal Test POS Change",
                "code": f"TCH{timestamp[:7]}",
                "type": "cash",
                "default_account_id": cls.cash_account.id,
            }
        )

        # Create POS config
        cls.pos_config = cls.env["pos.config"].create(
            {
                "name": "POS Test Config",
                "journal_id": cls.cash_journal.id,
            }
        )

        # Create payment method with cash receipt account
        cls.payment_method_change = cls.env["pos.payment.method"].create(
            {
                "name": "Cash with Cash Receipt Account",
                "journal_id": cls.cash_journal.id,
                "change_account_id": cls.change_account.id,
                "split_transactions": True,
            }
        )
        cls.pos_config.write(
            {"payment_method_ids": [Command.link(cls.payment_method_change.id)]}
        )

        # Create product
        cls.product = cls.env["product.product"].create(
            {
                "name": "Test Product",
                "type": "consu",
                "list_price": 100.0,
                "available_in_pos": True,
            }
        )

        # Create partner
        cls.partner = cls.env["res.partner"].create({"name": "Test Customer"})

    def _create_order_line(self, product, quantity, price_unit):
        """Helper to create properly formatted order line with all required fields."""
        price_subtotal = price_unit * quantity
        return (
            0,
            0,
            {
                "id": randint(1, 1000000),
                "product_id": product.id,
                "qty": quantity,
                "price_unit": price_unit,
                "price_subtotal": price_subtotal,
                "price_subtotal_incl": price_subtotal,
                "tax_ids": [(6, 0, [])],
            },
        )

    def _create_order_and_payment(self, amount, payment_method=None):
        """Helper to create a POS order with payment."""
        if payment_method is None:
            payment_method = self.payment_method_change

        # Open session
        self.pos_config.open_ui()
        session = self.pos_config.current_session_id

        # Create order
        order = self.env["pos.order"].create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "lines": [self._create_order_line(self.product, 1, amount)],
                "amount_total": amount,
                "amount_tax": 0.0,
                "amount_paid": amount,
                "amount_return": 0.0,
            }
        )

        # Create payment
        payment = self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "payment_method_id": payment_method.id,
                "amount": amount,
            }
        )

        # Set order as paid
        order.action_pos_order_paid()

        return order, payment, session

    def test_cash_change_account_basic_transfer(self):
        """Test basic cash transfer from cash receipt account to cash account."""
        # Create order with payment
        order, payment, session = self._create_order_and_payment(100.0)

        # Close the session to trigger accounting entries
        session.action_pos_session_closing_control()

        # Verify transfer move was created
        transfer_moves = self.env["account.move"].search(
            [
                ("journal_id", "=", self.cash_journal.id),
                ("ref", "ilike", session.name),
            ]
        )
        self.assertTrue(transfer_moves, "Transfer move should be created")

        # Verify move lines
        debit_lines = transfer_moves.line_ids.filtered(
            lambda line: line.account_id == self.cash_account and line.debit > 0
        )
        credit_lines = transfer_moves.line_ids.filtered(
            lambda line: line.account_id == self.change_account and line.credit > 0
        )

        self.assertTrue(debit_lines, "Debit line on cash account should exist")
        self.assertTrue(
            credit_lines, "Credit line on cash receipt account should exist"
        )
        self.assertEqual(
            sum(debit_lines.mapped("debit")),
            sum(credit_lines.mapped("credit")),
            "Debit and credit should be equal",
        )

    def test_cash_change_with_actual_change(self):
        """Test order with payment and change (negative payment)."""
        # Create order for 8.63
        order_amount = 8.63
        paid_amount = 10.0
        change_amount = paid_amount - order_amount

        # Open session
        self.pos_config.open_ui()
        session = self.pos_config.current_session_id

        # Create order
        order = self.env["pos.order"].create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "lines": [self._create_order_line(self.product, 1, order_amount)],
                "amount_total": order_amount,
                "amount_tax": 0.0,
                "amount_paid": order_amount,
                "amount_return": 0.0,
            }
        )

        # Create positive payment (customer paid)
        self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": paid_amount,
            }
        )

        # Create negative payment (change returned)
        self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": -change_amount,
            }
        )

        # Set order as paid
        order.action_pos_order_paid()

        # Close session
        session.action_pos_session_closing_control()

        # Verify split_receivables_cash was grouped correctly
        # The two payments should be combined into net amount (8.63)
        move = session.move_id
        self.assertTrue(move, "Session move should be created")

        # Verify change entry was created
        change_moves = self.env["account.move"].search(
            [
                ("journal_id", "=", self.cash_journal.id),
                ("ref", "ilike", "Cash change"),
                ("ref", "ilike", session.name),
            ]
        )
        self.assertTrue(change_moves, "Cash change move should be created")

        # Verify change move has correct structure
        change_debit_lines = change_moves.line_ids.filtered(
            lambda line: line.account_id == self.change_account and line.debit > 0
        )
        change_credit_lines = change_moves.line_ids.filtered(
            lambda line: line.account_id == self.cash_account and line.credit > 0
        )

        self.assertTrue(
            change_debit_lines, "Debit line on cash receipt account should exist"
        )
        self.assertTrue(change_credit_lines, "Credit line on cash account should exist")
        self.assertAlmostEqual(
            sum(change_debit_lines.mapped("debit")),
            change_amount,
            places=2,
            msg="Debit should equal change amount",
        )
        self.assertAlmostEqual(
            sum(change_credit_lines.mapped("credit")),
            change_amount,
            places=2,
            msg="Credit should equal change amount",
        )

    def test_multiple_orders_with_change(self):
        """Test multiple orders in same session with change."""
        self.pos_config.open_ui()
        session = self.pos_config.current_session_id

        # Order 1: 8.63, paid 10, change 1.37
        order1 = self.env["pos.order"].create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "lines": [self._create_order_line(self.product, 1, 8.63)],
                "amount_total": 8.63,
                "amount_tax": 0.0,
                "amount_paid": 8.63,
                "amount_return": 0.0,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order1.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": 10.0,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order1.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": -1.37,
            }
        )
        order1.action_pos_order_paid()

        # Order 2: 14.03, paid 20, change 5.97
        order2 = self.env["pos.order"].create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "lines": [self._create_order_line(self.product, 1, 14.03)],
                "amount_total": 14.03,
                "amount_tax": 0.0,
                "amount_paid": 14.03,
                "amount_return": 0.0,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order2.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": 20.0,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order2.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": -5.97,
            }
        )
        order2.action_pos_order_paid()

        # Close session
        session.action_pos_session_closing_control()

        # Verify total change amount (1.37 + 5.97 = 7.34)
        change_moves = self.env["account.move"].search(
            [
                ("journal_id", "=", self.cash_journal.id),
                ("ref", "ilike", "Cash change"),
                ("ref", "ilike", session.name),
            ]
        )
        self.assertTrue(change_moves, "Cash change move should be created")

        total_change = 1.37 + 5.97
        change_debit_lines = change_moves.line_ids.filtered(
            lambda line: line.account_id == self.change_account and line.debit > 0
        )
        change_credit_lines = change_moves.line_ids.filtered(
            lambda line: line.account_id == self.cash_account and line.credit > 0
        )

        # Should have 2 debit lines (one per order's change)
        self.assertEqual(
            len(change_debit_lines), 2, "Should have 2 debit lines for 2 changes"
        )

        # Total should match
        self.assertAlmostEqual(
            sum(change_debit_lines.mapped("debit")),
            total_change,
            places=2,
            msg="Total debit should equal total change",
        )
        self.assertAlmostEqual(
            sum(change_credit_lines.mapped("credit")),
            total_change,
            places=2,
            msg="Total credit should equal total change",
        )

    def test_payment_without_change_account(self):
        """Test that payments without change_account work normally."""
        # Create payment method without cash receipt account
        # payment_method_normal = self.pos_config.payment_method_ids.filtered(
        #     "is_cash_count"
        # )
        # if not payment_method_normal:
        #     return
        payment_method_normal = self.payment_method_change
        payment_method_normal.write({"change_account_id": False})

        # Create order with normal payment
        order, payment, session = self._create_order_and_payment(
            100.0, payment_method_normal
        )

        # Close session
        session.action_pos_session_closing_control()

        # Verify no change move was created
        change_moves = self.env["account.move"].search(
            [
                ("journal_id", "=", self.cash_journal.id),
                ("ref", "ilike", "Cash change"),
                ("ref", "ilike", session.name),
            ]
        )
        self.assertFalse(
            change_moves, "No cash change move should be created for normal payment"
        )

    def test_group_payments_by_order(self):
        """Test the _group_payments_by_order method directly."""
        self.pos_config.open_ui()
        session = self.pos_config.current_session_id

        # Create order with payment and change
        order = self.env["pos.order"].create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "lines": [self._create_order_line(self.product, 1, 8.63)],
                "amount_total": 8.63,
                "amount_tax": 0.0,
                "amount_paid": 8.63,
                "amount_return": 0.0,
            }
        )

        payment_pos = self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": 10.0,
            }
        )
        payment_neg = self.env["pos.payment"].create(
            {
                "pos_order_id": order.id,
                "payment_method_id": self.payment_method_change.id,
                "amount": -1.37,
            }
        )
        order.action_pos_order_paid()

        # Prepare input data
        split_receivables_cash = {
            payment_pos: {"amount": 10.0, "amount_converted": 10.0},
            payment_neg: {"amount": -1.37, "amount_converted": -1.37},
        }

        # Call the method
        grouped_receivables, total_change = session._group_payments_by_order(
            split_receivables_cash
        )

        # Verify grouping: should have 1 receivable and 1 change
        self.assertEqual(
            len(grouped_receivables), 1, "Should have 1 grouped receivable"
        )
        self.assertEqual(len(total_change), 1, "Should have 1 change entry")

        # Verify amounts
        main_payment = list(grouped_receivables.keys())[0]
        self.assertAlmostEqual(
            grouped_receivables[main_payment]["amount"],
            8.63,
            places=2,
            msg="Grouped amount should be net amount (10 - 1.37)",
        )

        change_payment = list(total_change.keys())[0]
        self.assertAlmostEqual(
            total_change[change_payment]["amount"],
            -1.37,
            places=2,
            msg="Change amount should be -1.37",
        )

    def test_combined_payment_with_change_no_split(self):
        """Test combined payments (split_transactions=False) with change.

        Should create:
        - Transfer entry from receipt account to cash account
        - NO separate cash change entry (change is included in combined payment)
        """
        # payment_method_combined = self.pos_config.payment_method_ids.filtered(
        #     "is_cash_count"
        # )
        # if not payment_method_combined:
        #     return
        payment_method_combined = self.payment_method_change
        payment_method_combined.write({"split_transactions": False})

        # Open session
        self.pos_config.open_ui()
        session = self.pos_config.current_session_id

        # Order 1: 8.63, paid 10, change 1.37
        order1 = self.env["pos.order"].create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "lines": [self._create_order_line(self.product, 1, 8.63)],
                "amount_total": 8.63,
                "amount_tax": 0.0,
                "amount_paid": 8.63,
                "amount_return": 0.0,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order1.id,
                "payment_method_id": payment_method_combined.id,
                "amount": 10.0,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order1.id,
                "payment_method_id": payment_method_combined.id,
                "amount": -1.37,
            }
        )
        order1.action_pos_order_paid()

        # Order 2: 20.00 exact payment
        order2 = self.env["pos.order"].create(
            {
                "session_id": session.id,
                "partner_id": self.partner.id,
                "lines": [self._create_order_line(self.product, 1, 20.0)],
                "amount_total": 20.0,
                "amount_tax": 0.0,
                "amount_paid": 20.0,
                "amount_return": 0.0,
            }
        )
        self.env["pos.payment"].create(
            {
                "pos_order_id": order2.id,
                "payment_method_id": payment_method_combined.id,
                "amount": 20.0,
            }
        )
        order2.action_pos_order_paid()

        # Close session
        session.action_pos_session_closing_control()

        # Verify NO cash change entry was created (since split_transactions=False)
        change_moves = self.env["account.move"].search(
            [
                ("journal_id", "=", self.cash_journal.id),
                ("ref", "ilike", "cash change"),
                ("ref", "ilike", session.name),
            ]
        )
        self.assertFalse(
            change_moves,
            "No cash change move should be created when split_transactions=False",
        )

        # Verify transfer entry was created
        transfer_moves = self.env["account.move"].search(
            [
                ("journal_id", "=", self.cash_journal.id),
                ("ref", "ilike", "Cash transfer"),
                ("ref", "ilike", session.name),
            ]
        )
        self.assertTrue(
            transfer_moves, "Transfer move should be created for combined payments"
        )

        # Verify transfer move has correct structure
        debit_lines = transfer_moves.line_ids.filtered(
            lambda line: line.account_id == self.cash_account and line.debit > 0
        )
        credit_lines = transfer_moves.line_ids.filtered(
            lambda line: line.account_id == self.change_account and line.credit > 0
        )

        self.assertTrue(debit_lines, "Debit line on cash account should exist")
        self.assertTrue(
            credit_lines, "Credit line on cash receipt account should exist"
        )

        # Net amount should be 28.63 (10 - 1.37 + 20)
        net_amount = 8.63 + 20.0
        self.assertAlmostEqual(
            sum(debit_lines.mapped("debit")),
            net_amount,
            places=2,
            msg="Debit should equal net cash amount",
        )
        self.assertAlmostEqual(
            sum(credit_lines.mapped("credit")),
            net_amount,
            places=2,
            msg="Credit should equal net cash amount",
        )
