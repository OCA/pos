from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("post_install", "-at_install")
class TestHacks(TestPoSCommon):
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
        cls.pos_user_assigned_pos = cls.env["res.users"].create(
            {
                "login": "pos_user_assigned_pos",
                "name": "pos_user_assigned_pos",
                "groups_id": [
                    (
                        6,
                        0,
                        [
                            cls.env.ref(
                                "pos_user_restriction.group_assigned_points_of_sale_user"
                            ).id
                        ],
                    )
                ],
            }
        )

    def test_get_closing_control_data(self):
        restricted_user = self.pos_user_assigned_pos
        self.config = self._create_basic_config()
        self.config.assigned_user_ids = [(6, 0, [restricted_user.id])]

        session = self.open_new_session()

        # make sure it does raise AccessError
        session.with_user(restricted_user).get_closing_control_data()
