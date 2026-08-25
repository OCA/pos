from odoo import Command
from odoo.tests import new_test_user, tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosBlindClosing(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # pos.config.write() in pos_hr may call action_create_employee().
        cls.env.user.group_ids += cls.env.ref("hr.group_hr_user")

    def _user_groups(self, *xmlids):
        return ",".join(xmlids)

    def test_blind_closing_hidden_for_cashier(self):
        user = new_test_user(
            self.env,
            login="pos_cashier_blind_closing_test",
            groups=self._user_groups(
                "base.group_user",
                "point_of_sale.group_pos_user",
            ),
        )
        self.main_pos_config.write({"module_pos_hr": False})
        self.main_pos_config.with_user(user).open_ui()
        self.start_pos_tour(
            "pos_blind_session_closing_hidden_for_cashier",
            login=user.login,
        )

    def test_blind_closing_visible_for_authorized_user(self):
        user = new_test_user(
            self.env,
            login="pos_manager_blind_closing_test",
            groups=self._user_groups(
                "base.group_user",
                "point_of_sale.group_pos_user",
                "pos_blind_session_closing.group_pos_close_session_amounts",
            ),
        )
        self.main_pos_config.write({"module_pos_hr": False})
        self.main_pos_config.with_user(user).open_ui()
        self.start_pos_tour(
            "pos_blind_session_closing_visible_for_manager",
            login=user.login,
        )

    def test_blind_closing_hidden_for_employee_without_linked_user(self):
        employee = self.env["hr.employee"].create(
            {
                "name": "Blind Employee Without User",
                "company_id": self.env.company.id,
            }
        )
        self.main_pos_config.write(
            {
                "module_pos_hr": True,
                # Close Register is only available to advanced/manager cashiers.
                "advanced_employee_ids": [Command.link(employee.id)],
            }
        )
        self.main_pos_config.with_user(self.pos_admin).open_ui()
        self.start_pos_tour(
            "pos_blind_session_closing_hr_hidden_for_employee_without_user",
            login="pos_admin",
        )

    def test_blind_closing_visible_for_employee_with_group_user(self):
        employee_user = new_test_user(
            self.env,
            login="pos_blind_hr_employee_with_group",
            groups=self._user_groups(
                "base.group_user",
                "point_of_sale.group_pos_user",
                "pos_blind_session_closing.group_pos_close_session_amounts",
            ),
        )
        employee = self.env["hr.employee"].create(
            {
                "name": "Blind Employee With Group",
                "user_id": employee_user.id,
                "company_id": self.env.company.id,
            }
        )
        self.main_pos_config.write(
            {
                "module_pos_hr": True,
                # Close Register is only available to advanced/manager cashiers.
                "advanced_employee_ids": [Command.link(employee.id)],
            }
        )
        self.main_pos_config.with_user(self.pos_admin).open_ui()
        self.start_pos_tour(
            "pos_blind_session_closing_hr_visible_for_employee_with_group",
            login="pos_admin",
        )
