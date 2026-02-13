from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_customer_popup(self):
        # copy of test_customer_popup to make sure
        # that customer choose functionality works fine
        self.env["res.partner"].create(
            [{"name": "Z partner to search"}, {"name": "Z partner to scroll"}]
        )
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.start_tour(
            f"/pos/ui/{self.main_pos_config.id}",
            "CustomerPopupTour",
            login="pos_user",
        )
