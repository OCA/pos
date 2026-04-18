import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_product_search_by_default_code(self):
        self.env["product.product"].create(
            {
                "name": "Test sofa",
                "available_in_pos": True,
                "default_code": "CHAIR_01",
            }
        )
        self.main_pos_config.display_default_code = True
        self.main_pos_config.with_user(self.pos_user).open_ui()
        self.main_pos_config.current_session_id.set_opening_control(0, "")
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "SearchProductByDefaultCode",
            login="pos_user",
        )
