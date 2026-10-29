# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosOrderMarkPaidFrontend(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.env["product.product"].create(
            [
                {
                    "name": name,
                    "type": "consu",
                    "available_in_pos": True,
                    "list_price": price,
                    "taxes_id": [(5, 0, 0)],
                }
                for name, price in (("Mark Paid A", 20.9), ("Mark Paid B", 10.07))
            ]
        )
        customer_account = cls.env["pos.payment.method"].create(
            {"name": "Customer Account"}
        )
        write_off_account = cls.env["account.account"].create(
            {"code": "WOFF01", "name": "POS Write-off", "account_type": "expense"}
        )
        cls.main_pos_config.write(
            {
                "payment_method_ids": [(4, customer_account.id)],
                "mark_paid_enabled": True,
                "mark_paid_account_id": write_off_account.id,
                "mark_paid_max_amount": 1.0,
                "mark_paid_max_percent": 4.0,
                "mark_paid_label": "Extra discount",
            }
        )

    def test_mark_paid_tour(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "PosOrderMarkPaidTour",
            login="pos_user",
        )
        orders = self.main_pos_config.current_session_id.order_ids
        self.assertEqual(len(orders), 2)
        order = orders.filtered("write_off_amount")
        self.assertEqual(order.state, "paid")
        self.assertAlmostEqual(order.write_off_amount, 0.07)
        self.assertAlmostEqual(order.amount_paid, 10.07)
        self.assertAlmostEqual(sum(order.payment_ids.mapped("amount")), 10.0)
