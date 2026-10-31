# Copyright 2026 INVITU (https://www.invitu.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestReceiptCashierFirstname(TestPointOfSaleHttpCommon):
    def test_receipt_cashier_firstname(self):
        self.pos_user.write({"firstname": "Jean", "lastname": "Dupont"})
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_pos_tour("ReceiptCashierFirstname", login="pos_user")

    def test_receipt_no_cashier_firstname(self):
        self.pos_user.write({"firstname": False, "lastname": "Dupont"})
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_pos_tour("ReceiptNoCashierFirstname", login="pos_user")
