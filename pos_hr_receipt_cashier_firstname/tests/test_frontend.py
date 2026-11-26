# Copyright 2026 INVITU (https://www.invitu.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from odoo.addons.pos_hr.tests.test_frontend import TestPosHrHttpCommon


@tagged("post_install", "-at_install")
class TestHrReceiptCashierFirstname(TestPosHrHttpCommon):
    def test_receipt_employee_firstname(self):
        self.emp2.write(
            {
                "firstname": "Marie",
                "lastname": "Durand",
                "pin": False,
                "work_email": "marie.durand@example.com",
            }
        )
        self.main_pos_config.with_user(self.pos_admin).open_ui()
        self.start_pos_tour("HrReceiptCashierFirstname", login="pos_admin")

    def test_receipt_employee_without_firstname(self):
        self.emp2.write(
            {
                "firstname": False,
                "lastname": "Durand",
                "pin": False,
                "work_email": "durand@example.com",
            }
        )
        self.main_pos_config.with_user(self.pos_admin).open_ui()
        self.start_pos_tour("HrReceiptNoCashierFirstname", login="pos_admin")
