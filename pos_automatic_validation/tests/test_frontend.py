# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosAutoValidation(TestPointOfSaleHttpCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.bank_payment_method.is_automatic_validation = True

    def test_auto_validation(self):
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_pos_tour("AutoValidationTour")
