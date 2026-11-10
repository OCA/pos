# Copyright 2026 Aurestic (https://www.aurestic.es) - Antonio Valdés
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from datetime import date, timedelta

from odoo.tests import TransactionCase, tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosGiftCardExpiration(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_user.write(
            {"groups_id": [(4, cls.env.ref("stock.group_stock_user").id)]}
        )
        # Only the gift card program created below must be available
        cls.env["loyalty.program"].search([]).write({"pos_ok": False})
        cls.env.ref("loyalty.gift_card_product_50").write({"active": True})
        program_id = cls.env["loyalty.program"].create_from_template("gift_card")[
            "res_id"
        ]
        cls.gift_card_program = cls.env["loyalty.program"].browse(program_id)
        cls.gift_card_program.pos_report_print_id = cls.env.ref(
            "loyalty.report_gift_card"
        )

    def _sell_gift_card(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        # Sells a 50.00 gift card paid in cash
        self.start_pos_tour("GiftCardProgramTour1")
        return self.gift_card_program.coupon_ids

    def _assert_expiration(self, card, expected):
        # The date is computed in the browser: tolerate a day of difference
        # due to timezones and leap years.
        self.assertTrue(card.expiration_date)
        self.assertLessEqual(abs((card.expiration_date - expected).days), 1)

    def test_gift_card_expires_with_program_duration(self):
        self.gift_card_program.duration_days = 180
        card = self._sell_gift_card()
        self.assertEqual(len(card), 1)
        self._assert_expiration(card, date.today() + timedelta(days=180))

    def test_gift_card_without_duration_keeps_standard_expiration(self):
        self.gift_card_program.duration_days = 0
        card = self._sell_gift_card()
        self.assertEqual(len(card), 1)
        self._assert_expiration(card, date.today() + timedelta(days=365))


@tagged("post_install", "-at_install")
class TestLoyaltyProgramPosData(TransactionCase):
    def test_duration_days_is_sent_to_pos(self):
        """The PoS needs ``duration_days`` to compute the expiration date."""
        program = self.env["loyalty.program"].create(
            {"name": "Test", "program_type": "gift_card", "duration_days": 180}
        )
        config = self.env["pos.config"].search([], limit=1)
        fields = self.env["loyalty.program"]._load_pos_data_fields(config.id)
        self.assertIn("duration_days", fields)
        self.assertEqual(program.read(fields, load=False)[0]["duration_days"], 180)
