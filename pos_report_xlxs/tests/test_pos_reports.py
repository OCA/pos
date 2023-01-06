from odoo.exceptions import Warning
from odoo.tests.common import TransactionCase


class TestPosReports(TransactionCase):
    def setUp(self):
        super().setUp()

        self.company_id = self.env.ref("base.main_company")

    def test_items_sales_report(self):
        model = self.env["pos.items.sales.report.xlxs.wizard"]
        wiz = model.create(
            {
                "date_start": "2023-05-08",
                "date_end": "2023-05-08",
                "company_id": self.company_id.id,
            }
        )

        with self.assertRaises(Warning):
            wiz.date_start = "2023-05-15"
            wiz._onchange_dates()

        self.assertTrue(isinstance(wiz.get_titles_style(), str))

        report_action = wiz.generate_report()
        self.assertTrue(isinstance(report_action, dict))
        self.assertEqual(
            report_action["views"][0][0],
            self.env.ref("pos_report_xlxs.view_pos_items_sales_report_wizard").id,
        )

        self.assertTrue(bool(wiz.rel_xls))
        self.assertEqual(wiz.rel_xls_filename, "pos_items_sales.xls")

    def test_order_items_sales_report(self):
        model = self.env["pos.order.items.sales.report.xlxs.wizard"]
        wiz = model.create(
            {
                "date_start": "2023-05-08",
                "date_end": "2023-05-08",
                "company_id": self.company_id.id,
            }
        )

        with self.assertRaises(Warning):
            wiz.date_start = "2023-05-15"
            wiz._onchange_dates()

        self.assertTrue(isinstance(wiz.get_titles_style(), str))

        report_action = wiz.generate_report()
        self.assertTrue(isinstance(report_action, dict))
        self.assertEqual(
            report_action["views"][0][0],
            self.env.ref(
                "pos_report_xlxs.pos_order_items_sales_report_xlxs_wizard_form_view"
            ).id,
        )

        self.assertTrue(bool(wiz.rel_xls))
        self.assertEqual(wiz.rel_xls_filename, "pos_order_items_sales.xls")

    def test_payment_receivings_report(self):
        model = self.env["pos.payment.receivings.report.xlxs.wizard"]
        wiz = model.create(
            {
                "date_start": "2023-05-08",
                "date_end": "2023-05-08",
                "company_id": self.company_id.id,
            }
        )

        with self.assertRaises(Warning):
            wiz.date_start = "2023-05-15"
            wiz._onchange_dates()

        self.assertTrue(isinstance(wiz.get_titles_style(), str))

        report_action = wiz.generate_report()
        self.assertTrue(isinstance(report_action, dict))
        self.assertEqual(
            report_action["views"][0][0],
            self.env.ref(
                "pos_report_xlxs.view_pos_payment_receivings_report_wizard"
            ).id,
        )

        self.assertTrue(bool(wiz.rel_xls))
        self.assertEqual(wiz.rel_xls_filename, "pos_payment_receivings.xls")
