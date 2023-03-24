# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestPosDiscountReason(TransactionCase):
    def setUp(self):
        super().setUp()

        self.pos_discount_reason_model = self.env["pos.discount.reason"]

    def test_discount_percent(self):
        discount_reason = self.pos_discount_reason_model.create(
            {"name": "DISCOUNT REASON TEST"}
        )

        with self.assertRaises(ValidationError):
            discount_reason.write({"percent": 1.5})
