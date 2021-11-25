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

        self.group_delete_order_line = self.env.ref(
            "pos_order_remove_line_access_right.group_delete_order_line"
        )
        self.assertEqual(
            self.group_delete_order_line,
            self.pos_config_main.group_delete_order_line_id,
        )
