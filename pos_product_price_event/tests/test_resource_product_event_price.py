# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestResourceProductEvent(TransactionCase):
    def setUp(self):
        super().setUp()

        self.attendance_model = self.env["resource.product.event"]
        self.event_model = self.env["resource.product.event.price"]
        self.event_name_model = self.env["resource.product.event.price.name"]
        self.product_id = self.env["product.template"].search([], limit=1)

        self.attendance_id = self.attendance_model.create({"week_day": "0"})

    def test_create_event(self):
        event_name_id = self.event_name_model.create({"name": "TEST NAME"})
        event_1 = self.event_model.create(
            {
                "event_id": self.attendance_id.id,
                "price": 1,
                "product_id": self.product_id.id,
                "event_name_id": event_name_id.id,
            }
        )
        onchange = event_1.onchange_product_id()

        self.assertEqual(event_1.display_name, event_name_id.name)
        self.assertIn("domain", onchange)
        self.assertIn("product_id", onchange["domain"])
        self.assertEqual(
            len(onchange["domain"]["product_id"]),
            2,
            "Onchange product template domain should have two "
            "leafs when there is a product on the event.",
        )

    def test_price_constrains(self):
        event_name_id = self.event_name_model.create({"name": "TEST NAME"})

        with self.assertRaises(ValidationError):
            self.event_model.create(
                {
                    "event_id": self.attendance_id.id,
                    "price": 0,
                    "product_id": self.product_id.id,
                    "event_name_id": event_name_id.id,
                }
            )
