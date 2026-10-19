from odoo.exceptions import ValidationError

from odoo.addons.base.tests.common import BaseCommon


class TestPosSessionUnicityManagement(BaseCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_config_1 = cls.env["pos.config"].create({"name": "Shop 1"})
        cls.pos_config_2 = cls.env["pos.config"].create({"name": "Shop 2"})
        cls.group_pos_multi_session = cls.env.ref(
            "pos_session_unicity_management.group_pos_multi_session"
        )
        cls.test_user = (
            cls.env["res.users"]
            .with_context(no_reset_password=True)
            .create(
                {
                    "name": "POS Cashier",
                    "login": "pos_cashier_unicity_test",
                    "groups_id": [(4, cls.env.ref("point_of_sale.group_pos_user").id)],
                }
            )
        )

    def test_01_single_session_allowed(self):
        """A user can always open one session."""
        session = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
                "user_id": self.test_user.id,
            }
        )
        self.assertIn(session.state, ("opening_control", "opened"))

    def test_02_cannot_open_two_sessions_same_user(self):
        """A user without the bypass group cannot have two active sessions."""
        self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
                "user_id": self.test_user.id,
            }
        )
        with self.assertRaises(ValidationError):
            self.env["pos.session"].create(
                {
                    "config_id": self.pos_config_2.id,
                    "user_id": self.test_user.id,
                }
            )

    def test_03_can_open_two_sessions_with_bypass_group(self):
        """A user with the bypass group can have multiple active sessions."""
        self.test_user.write(
            {
                "groups_id": [(4, self.group_pos_multi_session.id)],
            }
        )
        session_1 = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
                "user_id": self.test_user.id,
            }
        )
        session_2 = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_2.id,
                "user_id": self.test_user.id,
            }
        )
        self.assertIn(session_1.state, ("opening_control", "opened"))
        self.assertIn(session_2.state, ("opening_control", "opened"))

    def test_04_rescue_session_not_blocked(self):
        """Rescue sessions are never blocked, regardless of the user."""
        self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
                "user_id": self.test_user.id,
            }
        )
        rescue = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_2.id,
                "user_id": self.test_user.id,
                "rescue": True,
            }
        )
        self.assertTrue(rescue.rescue)

    def test_05_closing_session_allows_new_one(self):
        """Once a session is in closing_control state, the user may open another.

        The key assertion here is that no ValidationError is raised — the exact
        state of the new session depends on the POS config's cash control setup.
        """
        session_1 = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_1.id,
                "user_id": self.test_user.id,
            }
        )
        session_1.write({"state": "closing_control"})
        session_2 = self.env["pos.session"].create(
            {
                "config_id": self.pos_config_2.id,
                "user_id": self.test_user.id,
            }
        )
        self.assertIn(session_2.state, ("opening_control", "opened"))
