import json

from odoo.tests.common import tagged

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@tagged("-at_install", "post_install")
class TestPosOrderReportWizard(TestPoSCommon):
    def setUp(self):
        super().setUp()
        self.Wizard = self.env["pos.order.report.wizard"]

        # Create dummy fields if needed (simulate measure + groupby)
        self.field_qty = self.env["ir.model.fields"].search(
            [("model", "=", "report.pos.order"), ("name", "=", "product_qty")], limit=1
        )
        self.field_total = self.env["ir.model.fields"].search(
            [("model", "=", "report.pos.order"), ("name", "=", "price_total")], limit=1
        )

        # Create dummy record for wizard
        self.wizard = self.Wizard.create(
            {
                "horizontal_axis_id": self.field_qty.id,
                "measure_ids": [(6, 0, [self.field_qty.id, self.field_total.id])],
                "domain": json.dumps([]),
            }
        )
        self.config = self.basic_config
        self.open_new_session(0)
        self.product1 = self.create_product("Test Product A", self.categ_basic, 100, 50)

    def test_01_export_action(self):
        """Test that export_xlsx returns a valid act_url"""
        action = self.wizard.action_export_xlsx()
        self.assertTrue(action, "Export action should return a dict")
        self.assertEqual(action["type"], "ir.actions.act_url")
        self.assertIn(
            "/web/pivot/export_xlsx",
            action["url"],
            "Should call Odoo's pivot export endpoint",
        )

    def test_02_json_structure(self):
        """Test the generated jdata structure"""
        action = self.wizard.action_export_xlsx()
        url = action["url"]
        # Extract JSON data from URL
        data_str = url.split("data=")[-1]
        jdata = json.loads(data_str)

        # Validate JSON keys
        for key in ["title", "model", "rows", "measure_headers"]:
            self.assertIn(key, jdata, f"Missing key '{key}' in export JSON")

        self.assertEqual(jdata["model"], "report.pos.order")
        self.assertGreater(
            len(jdata["measure_headers"]), 0, "Should have at least one measure"
        )

    def test_03_grand_total_row(self):
        """Ensure a grand total row is present in the export"""
        action = self.wizard.action_export_xlsx()
        jdata = json.loads(action["url"].split("data=")[-1])
        rows = jdata.get("rows", [])
        self.assertTrue(
            any("Total" in row["title"] for row in rows),
            "Export must include a 'Total' row",
        )

    def test_04_translations_work(self):
        """Ensure self.env._() is used and no translation breaks"""
        # Force language context to something else
        self.env.user.lang = "fr_FR"
        action = self.wizard.action_export_xlsx()
        url = action["url"]
        jdata = json.loads(url.split("data=")[-1])
        # Title should still be present (in any language)
        self.assertTrue(jdata["title"], "Pivot export title should remain translatable")

    def test_05_data_accuracy_with_real_order(self):
        """Test that the export shows correct quantity and total for a new POS order."""
        # Create customer and product
        customer = self.env["res.partner"].create({"name": "Test Customer"})

        #  Create POS order (with 2 units × 100 each)
        order_datas = self.create_ui_order_data([(self.product1, 2)], customer=customer)
        self.env["pos.order"].sync_from_ui([order_datas])

        # Execute export
        action = self.wizard.action_export_xlsx()
        self.assertTrue(action, "Wizard export should return an action dict")

        jdata_str = action["url"].split("data=")[-1]
        jdata = json.loads(jdata_str)

        # Validate output rows
        rows = jdata.get("rows", [])
        self.assertTrue(rows, "Export should contain at least one data row")

        # Validate quantity and total
        found_row = next((r for r in rows if "Total" in r["title"]), None)
        self.assertTrue(found_row, "There must be a Total row")

        values = [v["value"] for v in found_row["values"]]
        total_qty = float(values[0])
        total_price = float(values[1])

        self.assertEqual(total_qty, 2.0, "Quantity in export must equal 2")
        self.assertEqual(total_price, 200.0, "Total in export must equal 200 (2 x 100)")
