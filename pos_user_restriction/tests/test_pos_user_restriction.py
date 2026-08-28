from odoo.tests import new_test_user

from odoo.addons.base.tests.common import BaseCommon


class TestUserRestriction(BaseCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_user = new_test_user(
            cls.env,
            login="pos_user",
            groups="point_of_sale.group_pos_user",
        )
        cls.pos_user_assigned_pos = new_test_user(
            cls.env,
            login="pos_user_assigned_pos",
            groups="pos_user_restriction.group_assigned_points_of_sale_user",
        )
        cls.pos_config_main = cls.env.ref("point_of_sale.pos_config_main")
        cls.pos_config_model = cls.env["pos.config"]

    def test_access_pos(self):
        # assigned_user_ids is not set: both users can read
        pos_configs = self.pos_config_model.with_user(self.pos_user.id).search(
            [
                (
                    "id",
                    "=",
                    self.pos_config_main.id,
                )  # for tests to pass if pos_restaurant is installed
            ]
        )
        self.assertTrue(pos_configs)
        pos_configs = self.pos_config_model.with_user(
            self.pos_user_assigned_pos.id
        ).search([("id", "=", self.pos_config_main.id)])
        self.assertTrue(pos_configs)

        self.pos_config_main.assigned_user_ids = [
            (6, 0, [self.pos_user_assigned_pos.id])
        ]
        # assigned_user_ids is set with pos_user_assigned_pos: both users can read
        pos_configs = self.pos_config_model.with_user(self.pos_user.id).search(
            [("id", "=", self.pos_config_main.id)]
        )
        self.assertTrue(pos_configs)
        pos_configs = self.pos_config_model.with_user(
            self.pos_user_assigned_pos.id
        ).search([("id", "=", self.pos_config_main.id)])
        self.assertTrue(pos_configs)
        self.pos_config_main.assigned_user_ids = [(6, 0, [self.pos_user.id])]
        # assigned_user_ids is set with pos_user: only pos_user can read
        pos_configs = self.pos_config_model.with_user(self.pos_user.id).search(
            [("id", "=", self.pos_config_main.id)]
        )
        self.assertTrue(pos_configs)
        pos_configs = self.pos_config_model.with_user(
            self.pos_user_assigned_pos.id
        ).search([("id", "=", self.pos_config_main.id)])
        self.assertFalse(pos_configs)

        self.assigned_group = self.env.ref(
            "pos_user_restriction.group_assigned_points_of_sale_user"
        )
        self.assertEqual(self.assigned_group, self.pos_config_main.group_pos_user_id)

        self.assertFalse(pos_configs)
