from odoo import Command
from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosBlindClosing(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.pos_hr_installed = bool(
            cls.env["ir.module.module"]
            .search([("name", "=", "pos_hr"), ("state", "=", "installed")])
        )

    def _create_user(self, login, groups):
        return (
            self.env["res.users"]
            .with_context(no_reset_password=True)
            .create(
                {
                    "name": login,
                    "login": login,
                    "email": f"{login}@example.com",
                    "group_ids": [(6, 0, groups)],
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

        self.start_pos_tour(
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

        self.start_pos_tour(
            "pos_blind_session_closing_visible_for_manager",
            login=user.login,
        )

    def test_blind_closing_hidden_for_employee_without_linked_user(self):
        if not self.pos_hr_installed:
            self.skipTest("pos_hr is not installed")

        can_see_closing_amounts = self.env.ref(
            "pos_blind_session_closing.group_pos_close_session_amounts"
        )
        backend_user = self._create_user(
            "pos_blind_hr_backend_with_group",
            [
                self.env.ref("base.group_user").id,
                self.env.ref("point_of_sale.group_pos_user").id,
                can_see_closing_amounts.id,
            ],
        )
        employee = self.env["hr.employee"].create(
            {
                "name": "Blind Employee Without User",
            }
        )
        self.main_pos_config.write(
            {
                "module_pos_hr": True,
                "basic_employee_ids": [Command.link(employee.id)],
            }
        )
        self.main_pos_config.with_user(backend_user).open_ui()
        self.start_pos_tour(
            "pos_blind_session_closing_hr_hidden_for_employee_without_user",
            login=backend_user.login,
        )

    def test_blind_closing_visible_for_employee_with_group_user(self):
        if not self.pos_hr_installed:
            self.skipTest("pos_hr is not installed")

        can_see_closing_amounts = self.env.ref(
            "pos_blind_session_closing.group_pos_close_session_amounts"
        )
        backend_user = self._create_user(
            "pos_blind_hr_backend_without_group",
            [
                self.env.ref("base.group_user").id,
                self.env.ref("point_of_sale.group_pos_user").id,
            ],
        )
        employee_user = self._create_user(
            "pos_blind_hr_employee_with_group",
            [
                self.env.ref("base.group_user").id,
                self.env.ref("point_of_sale.group_pos_user").id,
                can_see_closing_amounts.id,
            ],
        )
        employee = self.env["hr.employee"].create(
            {
                "name": "Blind Employee With Group",
                "user_id": employee_user.id,
            }
        )
        self.main_pos_config.write(
            {
                "module_pos_hr": True,
                "basic_employee_ids": [Command.link(employee.id)],
            }
        )
        self.main_pos_config.with_user(backend_user).open_ui()
        self.start_pos_tour(
            "pos_blind_session_closing_hr_visible_for_employee_with_group",
            login=backend_user.login,
        )
