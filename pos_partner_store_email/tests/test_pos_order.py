# Copyright 2026 Daniel Reis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
import base64

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


class TestPosOrderStoreEmail(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config = cls.basic_config
        cls.config.open_ui()
        cls.session = cls.config.current_session_id
        cls.ticket_image = base64.b64encode(b"ticket")

    def _create_order(self, partner=False):
        return self.env["pos.order"].create(
            {
                "session_id": self.session.id,
                "partner_id": partner.id if partner else False,
                "amount_total": 0,
                "amount_paid": 0,
                "amount_tax": 0,
                "amount_return": 0,
            }
        )

    def test_receipt_email_stored_on_partner(self):
        """Sending a receipt to an address stored on the order with an
        email-less customer updates the customer record."""
        partner = self.env["res.partner"].create({"name": "New Customer"})
        order = self._create_order(partner)

        order.action_send_receipt("customer@example.com", self.ticket_image, False)

        self.assertEqual(partner.email, "customer@example.com")
        self.assertEqual(order.email, "customer@example.com")

    def test_receipt_email_overwrites_partner(self):
        """Sending a receipt to a different address updates the customer
        record to the new email."""
        partner = self.env["res.partner"].create(
            {"name": "Regular", "email": "old@example.com"}
        )
        order = self._create_order(partner)

        order.action_send_receipt("new@example.com", self.ticket_image, False)

        self.assertEqual(partner.email, "new@example.com")

    def test_receipt_email_opt_out(self):
        """Sending a receipt with the "do not update" option leaves the
        customer email untouched, while the order still keeps the address."""
        partner = self.env["res.partner"].create(
            {"name": "Regular", "email": "old@example.com"}
        )
        order = self._create_order(partner)

        order.action_send_receipt(
            "other@example.com",
            self.ticket_image,
            False,
            update_partner_email=False,
        )

        self.assertEqual(partner.email, "old@example.com")
        self.assertEqual(order.email, "other@example.com")

    def test_receipt_email_same_normalized(self):
        """Sending a receipt to the same address with different casing does
        not rewrite the customer email."""
        partner = self.env["res.partner"].create(
            {"name": "Regular", "email": "same@example.com"}
        )
        order = self._create_order(partner)
        write_date = partner.write_date

        order.action_send_receipt("SAME@example.com", self.ticket_image, False)

        self.assertEqual(partner.email, "same@example.com")
        self.assertEqual(partner.write_date, write_date)

    def test_receipt_email_no_partner(self):
        """Sending a receipt for an anonymous order does not fail; the email
        stays on the order only."""
        order = self._create_order()

        order.action_send_receipt("someone@example.com", self.ticket_image, False)

        self.assertEqual(order.email, "someone@example.com")
