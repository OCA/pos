# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestPosCategoryComboRule(TransactionCase):
    def setUp(self):
        super().setUp()

        self.combo_rule_model = self.env["combo.rule"]

    def get_combo_rule_items(self):
        item_1_categories = self.env["pos.category"].search([], limit=2)
        item_2_categories = self.env["pos.category"].search(
            [("id", "not in", item_1_categories.ids)], limit=2
        )

        return [
            (
                0,
                0,
                {"category_ids": item_1_categories, "discount_amount": 0},
            ),
            (
                0,
                0,
                {"category_ids": item_2_categories, "discount_amount": 0},
            ),
        ]

    def test_duplicated_combo_rule_items_constrains(self):
        combo_rule_items = self.get_combo_rule_items()

        self.combo_rule_model.create(
            {
                "name": "TEST RULE 1",
                "combo_rule_item_ids": combo_rule_items,
            }
        )

        with self.assertRaises(ValidationError):
            self.combo_rule_model.create(
                {
                    "name": "TEST RULE 2",
                    "combo_rule_item_ids": combo_rule_items,
                }
            )

    def test_combo_rules_items_map(self):
        assert isinstance(self.combo_rule_model.get_combo_rules_items_map(), dict)
