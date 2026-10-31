from odoo.tests.common import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPosContainerDeposit(TestPointOfSaleHttpCommon):
    def run_tour(self):
        self.main_pos_config.open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "pos_container_deposit.test_tour",
            login="accountman",
        )
