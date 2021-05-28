from odoo.tests.common import SavepointCase


class TestUserRestriction(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(
            context=dict(
                cls.env.context,
                tracking_disable=True,
                no_reset_password=True,
            )
        )
        cls.pos_user = cls.env["res.users"].create(
            {
                "login": "pos_user",
                "name": "pos_user",
                "groups_id": [(6, 0, [cls.env.ref("point_of_sale.group_pos_user").id])],
            }
        )
        cls.pos_config_main = cls.env.ref("point_of_sale.pos_config_main")
        cls.pos_config_model = cls.env["pos.config"]

    def test_access_pos(self):
        self.pos_config_main._compute_groups()
        self.group_negative_qty = self.env.ref("pos_access_right.group_negative_qty")
        self.assertEqual(
            self.group_negative_qty, self.pos_config_main.group_negative_qty_id
        )

        self.group_discount = self.env.ref("pos_access_right.group_discount")
        self.assertEqual(self.group_discount, self.pos_config_main.group_discount_id)

        self.group_change_unit_price = self.env.ref(
            "pos_access_right.group_change_unit_price"
        )
        self.assertEqual(
            self.group_change_unit_price,
            self.pos_config_main.group_change_unit_price_id,
        )

        self.group_multi_order = self.env.ref("pos_access_right.group_multi_order")
        self.assertEqual(
            self.group_multi_order, self.pos_config_main.group_multi_order_id
        )

        self.group_delete_order = self.env.ref("pos_access_right.group_delete_order")
        self.assertEqual(
            self.group_delete_order, self.pos_config_main.group_delete_order_id
        )

        self.group_payment = self.env.ref("pos_access_right.group_payment")
        self.assertEqual(self.group_payment, self.pos_config_main.group_payment_id)
