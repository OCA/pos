from odoo.tests.common import TransactionCase


class TestPosSession(TransactionCase):
    def setUp(self):
        super().setUp()
        self.pos_config = self.env.ref("point_of_sale.pos_config_main").copy()
        self.products = self.env["product.product"].search([], limit=3)
        self.pos_config.product_ids = self.products

    def test_create_session(self):
        session = self.env["pos.session"].create(
            {"user_id": 1, "config_id": self.pos_config.id}
        )

        self.assertEqual(
            session.pos_session_product_control_ids.mapped("product_id"), self.products
        )

        product1 = self.products[0]
        product2 = self.products[1]

        product1_control = session.pos_session_product_control_ids.filtered(
            lambda s: s.product_id == product1
        )
        product2_control = session.pos_session_product_control_ids.filtered(
            lambda s: s.product_id == product2
        )

        session.update_product_opening_value({product1.id: 3})
        session.update_product_opening_value({product2.id: 5})
        self.assertEqual(product1_control.product_real_start_value, 3)
        self.assertEqual(product2_control.product_real_start_value, 5)

        session.update_product_closing_value({product1.id: 1})
        session.update_product_closing_value({product2.id: 2})
        self.assertEqual(product1_control.product_real_end_value, 1)
        self.assertEqual(product2_control.product_real_end_value, 2)
        self.assertEqual(
            product1_control.product_inventory_end_value, product1.qty_available
        )
        self.assertEqual(
            product2_control.product_inventory_end_value, product2.qty_available
        )

        expected_p1_balance = (
            product1_control.product_real_start_value
            - product1_control.product_real_end_value
        )
        self.assertEqual(
            product1_control.product_real_balance_value, expected_p1_balance
        )

        expected_p2_balance = (
            product2_control.product_real_start_value
            - product2_control.product_real_end_value
        )
        self.assertEqual(
            product2_control.product_real_balance_value, expected_p2_balance
        )

        expected_p1_inv_balance = (
            product1_control.product_inventory_start_value
            - product1_control.product_inventory_end_value
        )
        self.assertEqual(
            product1_control.product_inventory_balance_value, expected_p1_inv_balance
        )

        expected_p2_inv_balance = (
            product2_control.product_inventory_start_value
            - product2_control.product_inventory_end_value
        )
        self.assertEqual(
            product2_control.product_inventory_balance_value, expected_p2_inv_balance
        )
