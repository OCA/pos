# Copyright 2023 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


import odoo.tests

from odoo.addons.point_of_sale.tests.common import TestPoSCommon
from odoo.addons.pos_disable_rescue_session.models.pos_order import (
    RescueSessionUnavailableError,
)


@odoo.tests.tagged("post_install", "-at_install")
class TestPoSDisableRescueSession(TestPoSCommon):
    def setUp(self):
        super().setUp()
        self.config = self.basic_config

        # Add the option to disable the rescue session
        self.config.disable_rescue_session = True

        self.product1 = self.create_product(
            "Product 1",
            self.categ_basic,
            lst_price=10.99,
            standard_price=5.0,
            tax_ids=self.taxes["tax7"].ids,
        )
        self.product2 = self.create_product(
            "Product 2",
            self.categ_basic,
            lst_price=19.99,
            standard_price=10.0,
            tax_ids=self.taxes["tax10"].ids,
            sale_account=self.other_sale_account,
        )
        self.product3 = self.create_product(
            "Product 3",
            self.categ_basic,
            lst_price=30.99,
            standard_price=15.0,
            tax_ids=self.taxes["tax_group_7_10"].ids,
        )
        self.adjust_inventory(
            [self.product1, self.product2, self.product3], [100, 50, 50]
        )

    def test_pos_disable_rescue_session_accept_orders_on_opened_sesion(self):
        self.open_new_session()
        orders = []
        orders.append(
            self.create_ui_order_data(
                [(self.product1, 10), (self.product2, 10), (self.product3, 10)]
            )
        )
        orders.append(
            self.create_ui_order_data(
                [(self.product1, 5), (self.product2, 5)],
                payments=[(self.bank_pm, 158.75)],
            )
        )
        orders.append(
            self.create_ui_order_data(
                [(self.product2, 5), (self.product3, 5)],
                payments=[(self.bank_pm, 264.76)],
                customer=self.other_customer,
                is_invoiced=True,
                uid="09876-098-0987",
            )
        )

        self.env["pos.order"].create_from_ui(orders)
        self.assertEqual(3, self.pos_session.order_count)
        orders_total = sum(order.amount_total for order in self.pos_session.order_ids)
        self.assertAlmostEqual(
            orders_total,
            self.pos_session.total_payments_amount,
            msg="Total order amount should be equal to the total payment amount.",
        )
        self.assertEqual(
            len(
                self.pos_session.order_ids.filtered(
                    lambda order: order.state == "invoiced"
                )
            ),
            1,
            "There should only be one invoiced order.",
        )

    def test_pos_disable_rescue_session_reject_orders_on_closed_session(self):
        self.open_new_session()
        original_session_id = self.pos_session.id

        orders = []
        orders.append(
            self.create_ui_order_data(
                [(self.product1, 10), (self.product2, 10), (self.product3, 10)]
            )
        )
        orders.append(
            self.create_ui_order_data(
                [(self.product1, 5), (self.product2, 5)],
                payments=[(self.bank_pm, 158.75)],
            )
        )
        orders.append(
            self.create_ui_order_data(
                [(self.product2, 5), (self.product3, 5)],
                payments=[(self.bank_pm, 264.76)],
                customer=self.other_customer,
                is_invoiced=True,
                uid="09876-098-0987",
            )
        )

        # Close the session
        self.pos_session.action_pos_session_validate()

        # The backend should raise an error
        with self.assertRaises(RescueSessionUnavailableError):
            self.env["pos.order"].create_from_ui(orders)

        # Now open another session
        self.open_new_session()

        self.assertNotEqual(
            original_session_id,
            self.pos_session.id,
            "The session should have changed.",
        )

        # The orders should have the old session id
        self.assertEqual(
            orders[0]["data"]["pos_session_id"],
            original_session_id,
            "The session id should not have changed.",
        )

        self.env["pos.order"].create_from_ui(orders)

        self.assertEqual(3, self.pos_session.order_count)
        orders_total = sum(order.amount_total for order in self.pos_session.order_ids)
        self.assertAlmostEqual(
            orders_total,
            self.pos_session.total_payments_amount,
            msg="Total order amount should be equal to the total payment amount.",
        )
        self.assertEqual(
            len(
                self.pos_session.order_ids.filtered(
                    lambda order: order.state == "invoiced"
                )
            ),
            1,
            "There should only be one invoiced order.",
        )

    def test_pos_disable_rescue_session_accept_orders_on_closed_session_when_not_enabled(
        self,
    ):
        self.open_new_session()
        self.config.disable_rescue_session = False

        orders = []
        orders.append(
            self.create_ui_order_data(
                [(self.product1, 10), (self.product2, 10), (self.product3, 10)]
            )
        )
        orders.append(
            self.create_ui_order_data(
                [(self.product1, 5), (self.product2, 5)],
                payments=[(self.bank_pm, 158.75)],
            )
        )
        orders.append(
            self.create_ui_order_data(
                [(self.product2, 5), (self.product3, 5)],
                payments=[(self.bank_pm, 264.76)],
                customer=self.other_customer,
                is_invoiced=True,
                uid="09876-098-0987",
            )
        )

        # Close the session
        self.pos_session.action_pos_session_validate()

        self.assertEqual(
            self.env["pos.session"].search_count([("rescue", "=", True)]),
            0,
            "There should be no rescue orders.",
        )
        # The backend should not raise an error
        self.env["pos.order"].create_from_ui(orders)

        self.assertEqual(0, self.pos_session.order_count)
        rescue = self.env["pos.session"].search([("rescue", "=", True)])
        self.assertEqual(
            len(rescue),
            1,
            "There should be one rescue order.",
        )
        self.assertEqual(3, rescue.order_count)
