from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
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
        self.start_tour(
            f"/pos/ui/{self.main_pos_config.id}",
            "SearchProductByDefaultCode",
            login="pos_user",
        )
