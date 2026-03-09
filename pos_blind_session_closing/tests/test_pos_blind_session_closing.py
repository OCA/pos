from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosBlindClosing(TestPointOfSaleHttpCommon):
    def _create_user(self, login, groups):
        return (
            self.env["res.users"]
            .with_context(no_reset_password=True)
            .create(
                {
                    "name": login,
                    "login": login,
                    "email": f"{login}@example.com",
                    "groups_id": [(6, 0, groups)],
                }
            )
        )

    def test_blind_closing_hidden_for_cashier(self):
        base_user = self.env.ref("base.group_user").id
        pos_user_group = self.env.ref("point_of_sale.group_pos_user").id

        user = self._create_user(
            "pos_cashier_blind_closing_test",
            [base_user, pos_user_group],
        )

        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "pos_blind_session_closing_hidden_for_cashier",
            login=user.login,
        )

    def test_blind_closing_visible_for_authorized_user(self):
        base_user = self.env.ref("base.group_user").id
        pos_user_group = self.env.ref("point_of_sale.group_pos_user").id
        can_see_closing_amounts = self.env.ref(
            "pos_blind_session_closing.group_pos_close_session_amounts"
        ).id

        user = self._create_user(
            "pos_manager_blind_closing_test",
            [base_user, pos_user_group, can_see_closing_amounts],
        )

        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "pos_blind_session_closing_visible_for_manager",
            login=user.login,
        )
