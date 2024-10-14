# Copyright 2024 Camptocamp
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import tagged

from odoo.addons.base.tests.common import DISABLED_MAIL_CONTEXT
from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosLoyaltyExclude(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env["base"].with_context(**DISABLED_MAIL_CONTEXT).env

    def test_exclude_loyalty_program(self):
        self.env["loyalty.program"].search([]).write({"active": False})
        self.test_product_1 = self.env["product.product"].create(
            {
                "name": "Product Exclude Loyalty",
                "type": "product",
                "list_price": 100,
                "available_in_pos": True,
                "loyalty_exclude": True,
                "taxes_id": False,
            }
        )
        self.test_product_2 = self.env["product.product"].create(
            {
                "name": "Product Include Loyalty",
                "type": "product",
                "list_price": 100,
                "available_in_pos": True,
                "loyalty_exclude": False,
                "taxes_id": False,
            }
        )
        self.loyalty_program = self.env["loyalty.program"].create(
            {
                "name": "Loyalty Program",
                "program_type": "loyalty",
                "pos_ok": True,
                "rule_ids": [
                    (
                        0,
                        0,
                        {
                            "minimum_amount": 100,
                            "minimum_qty": 1,
                            "reward_point_mode": "order",
                            "reward_point_amount": 500,
                        },
                    )
                ],
                "reward_ids": [
                    (
                        0,
                        0,
                        {
                            "required_points": 500,
                            "reward_type": "discount",
                            "discount": "10",
                            "discount_mode": "per_order",  # -10$ per order
                        },
                    )
                ],
            }
        )

        partner = self.env["res.partner"].create({"name": "Mr Odoo"})
        self.env["loyalty.card"].create(
            {
                "partner_id": partner.id,
                "program_id": self.loyalty_program.id,
                "points": 500,
            }
        )

        self.main_pos_config.open_ui()

        self.start_tour(
            "/pos/web?config_id=%d" % self.main_pos_config.id,
            "PosExcludeLoyaltyPromotion",
            login="accountman",
        )
