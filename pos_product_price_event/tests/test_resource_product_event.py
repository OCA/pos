# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestResourceProductAttendance(TransactionCase):
    def setUp(self):
        super().setUp()

        self.attendance_model = self.env["resource.product.event"]
        self.event_name_model = self.env["resource.product.event.price.name"]

    def test_create_attendance(self):
        att = self.attendance_model.create({"week_day": "0"})
        week_day_str = dict(self.attendance_model._fields["week_day"].selection).get(
            att.week_day
        )

        self.assertEqual(
            att.display_name,
            week_day_str,
            "Display name should be equals the week_day name",
        )

    def test_duplicated_product_constrains(self):
        event_1_product_id = self.env["product.template"].search([], limit=1).id
        event_name = self.event_name_model.create({"name": "TEST NAME"})
        price_event_ids = [
            (
                0,
                0,
                {
                    "price": 1,
                    "event_name_id": event_name.id,
                    "product_id": event_1_product_id,
                },
            ),
            (
                0,
                0,
                {
                    "price": 1,
                    "event_name_id": event_name.id,
                    "product_id": event_1_product_id,
                },
            ),
        ]

        with self.assertRaises(ValidationError):
            self.attendance_model.create(
                {
                    "week_day": "0",
                    "price_event_ids": price_event_ids,
                }
            )
