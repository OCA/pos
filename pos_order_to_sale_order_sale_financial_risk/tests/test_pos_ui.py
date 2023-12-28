from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_pos_order_to_sale_order_financial_risk(self):
        self.main_pos_config.open_ui()
        self.env["res.partner"].create(
            {
                "name": "Abdulah",
                "company_type": "company",
                "risk_sale_order_include": True,
                "risk_sale_order_limit": 2,
                "credit_limit": 2,
            }
        )
        self.start_tour(
            f"/pos/ui?config_id={self.main_pos_config.id}",
            "SaleOrderConfirmFinancialRiskPosCompatibility",
            login="accountman",
        )
