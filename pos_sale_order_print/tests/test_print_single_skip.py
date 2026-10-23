from odoo.tests import tagged

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestPrintSingleSkipOCA(TestPointOfSaleHttpCommon):
    def setUp(self):
        super().setUp()
        partner = self.env["res.partner"].search([], limit=1)
        self.order = self.env["sale.order"].create({"partner_id": partner.id})
        self.order.action_confirm()

    def test01_print_single_skip_popup(self):
        report = self.env["ir.actions.report"].create(
            {
                "name": "Test Report A",
                "model": "sale.order",
                "report_name": "report",
            }
        )
        self.main_pos_config.write(
            {
                "print_sales_order_ids": [(6, 0, [report.id])],
            }
        )
        self.main_pos_config.open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "print_single_report_direct_action_tour_oca",
            login="accountman",
        )

    def test02_print_multiple_shows_popup(self):
        report_a = self.env["ir.actions.report"].create(
            {
                "name": "Test Report A",
                "model": "sale.order",
                "report_name": "report A",
            }
        )
        report_b = self.env["ir.actions.report"].create(
            {
                "name": "Test Report B",
                "model": "sale.order",
                "report_name": "report B",
            }
        )
        self.main_pos_config.write(
            {
                "print_sales_order_ids": [(6, 0, [report_a.id, report_b.id])],
            }
        )
        self.main_pos_config.open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "print_multi_report_selection_tour_oca",
            login="accountman",
        )

    def test03_no_print_config_shows_error(self):
        partner = self.env["res.partner"].search([], limit=1)
        self.env["sale.order"].create(
            {
                "partner_id": partner.id,
            }
        )
        self.main_pos_config.open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "print_no_reports_error_popup_tour_oca",
            login="accountman",
        )
