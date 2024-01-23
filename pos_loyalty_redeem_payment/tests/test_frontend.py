from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.voucher_payment_method = cls.env["pos.payment.method"].create(
            {
                "name": "Voucher",
                "receivable_account_id": cls.company_data[
                    "default_account_receivable"
                ].id,
                "journal_id": cls.company_data["default_journal_cash"].id,
                "company_id": cls.env.company.id,
                "used_for_loyalty_program": True,
            }
        )
        cls.main_pos_config.write(
            {"payment_method_ids": [(4, cls.voucher_payment_method.id)]}
        )

    def setUp(self):
        super().setUp()
        self.main_pos_config.write(
            {
                "tax_regime_selection": False,
                "use_pricelist": False,
                "gift_card_settings": "scan_use",
            }
        )
        self.program1 = self.configure_program()
        self.main_pos_config.open_ui()

    def create_programs(self, details):
        LoyaltyProgram = self.env["loyalty.program"]
        programs = {}  # map: name -> program
        for (name, program_type) in details:
            program_id = LoyaltyProgram.create_from_template(program_type)["res_id"]
            program = LoyaltyProgram.browse(program_id)
            program.write({"name": name})
            programs[name] = program
        return programs

    def configure_program(self):
        program_obj = self.env["loyalty.program"]
        (program_obj.search([])).write({"pos_ok": False})
        self.env.ref("loyalty.gift_card_product_50").write({"active": True})
        gift_card_program = self.create_programs([("Gift Card Program", "gift_card")])[
            "Gift Card Program"
        ]
        self.env["loyalty.generate.wizard"].with_context(
            active_id=gift_card_program.id
        ).create({"coupon_qty": 1, "points_granted": 50.00}).generate_coupons()
        gift_card_program.coupon_ids.code = "044123456"
        gift_card_program.redeem_method = "payment_method"
        gift_card_program.write(
            {"pos_payment_method_ids": [(4, self.voucher_payment_method.id)]}
        )

        return gift_card_program

    def test_gift_card_as_redeem_payment(self):
        """
        1º Tour: Check that we have generate a new pos order
          paid with a gift card as payment method.
        2º Tour: Display error on redeeming an amount greater
          that allowed by total amount and code points.
        """
        self.start_tour(
            "/pos/web?config_id=%d" % self.main_pos_config.id,
            "GiftCardProgramAsRedeemPayment",
            login="accountman",
        )
        # check order has been created and coupon points substracted
        pos_order = self.env["pos.order"].search([], limit=1)
        voucher_payment = pos_order.payment_ids.filtered(
            lambda x: x.payment_method_id.name == "Voucher"
        )
        self.assertEqual(voucher_payment.payment_method_id.name, "Voucher")
        self.assertEqual(voucher_payment.amount, 1.00)
        coupon_id = self.program1.coupon_ids[0]
        self.assertEqual(coupon_id.points, 49.00)

        self.start_tour(
            "/pos/web?config_id=%d" % self.main_pos_config.id,
            "GiftCardProgramAsRedeemPayment2",
            login="accountman",
        )

    def test_multiple_gift_cards_as_redeem_payment(self):
        """
        Check multiples gift card vouchers used as redeem payment in the same payment method.
        """
        self.env["loyalty.generate.wizard"].with_context(
            active_id=self.program1.id
        ).create({"coupon_qty": 1, "points_granted": 30.00}).generate_coupons()
        coupon = self.program1.coupon_ids.filtered(lambda x: x.code != "044123456")
        coupon.code = "044123457"

        self.start_tour(
            "/pos/web?config_id=%d" % self.main_pos_config.id,
            "MultipleGiftCardsAsRedeemPayment",
            login="accountman",
        )
