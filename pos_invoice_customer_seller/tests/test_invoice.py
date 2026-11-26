# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("post_install_l10n", "post_install", "-at_install")
class TestUi(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Create a seller
        cls.seller = cls.env["res.users"].create(
            {"name": "Seller 1", "login": "seller_1"}
        )
        cls.customer.user_id = cls.seller
        cls.config = cls.basic_config
        cls.config.set_seller_invoice = True
        cls.product100 = cls.create_product("Product_100", cls.categ_basic, 100, 50)
        cls.payment_methods = cls.cash_pm1
        cls.orders = [
            {
                "pos_order_lines_ui_args": [(cls.product100, 1)],
                "payments": [(cls.cash_pm1, 100)],
                "customer": cls.customer,
                "is_invoiced": True,
                "uuid": "00100-010-0001",
            },
        ]

    def test_invoice_seller(self):
        self._start_pos_session(self.payment_methods, 0)
        orders_map = self._create_orders(self.orders)
        self.assertEqual(
            orders_map["00100-010-0001"].account_move.invoice_user_id, self.seller
        )
