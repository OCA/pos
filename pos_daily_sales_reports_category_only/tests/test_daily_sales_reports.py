# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

import odoo
from odoo import fields

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestDailySalesReport(TestPoSCommon):
    def setUp(self):
        super().setUp()
        self.config = self.basic_config

    def test_get_sale_details(self):
        today = fields.Date.today()
        data = self.env["report.point_of_sale.report_saledetails"].get_sale_details(
            date_start=today,
            date_stop=today,
            config_ids=[self.config.id],
            session_ids=False,
        )
        self.assertIn("sales_report_by_category_only", data)
