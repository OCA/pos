from unittest.mock import patch

from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install")
class TestPosStockAvailableOnline(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.company
        cls.main_warehouse = cls.env["stock.warehouse"].search(
            [("company_id", "=", cls.company.id)], limit=1
        )
        cls.extra_warehouse = cls.env["stock.warehouse"].create(
            {
                "name": "POS Extra Warehouse",
                "code": "PEW",
                "company_id": cls.company.id,
            }
        )
        cls.product = cls.env["product.product"].create(
            {
                "name": "POS Stock Product",
                "is_storable": True,
                "available_in_pos": True,
                "sale_ok": True,
                "taxes_id": False,
            }
        )
        cls.env["stock.quant"]._update_available_quantity(
            cls.product, cls.main_warehouse.lot_stock_id, 7.0
        )
        cls.env["stock.quant"]._update_available_quantity(
            cls.product, cls.extra_warehouse.lot_stock_id, 3.0
        )
        cls.config = cls.env["pos.config"].create(
            {
                "name": "POS Stock Available Online",
                "display_product_quantity": True,
                "warehouse_id": cls.main_warehouse.id,
                "additional_warehouse_ids": [(6, 0, cls.extra_warehouse.ids)],
                "minimum_product_quantity_alert": 2.0,
            }
        )

    def test_stock_warehouse_prepare_vals_uses_warehouse_location(self):
        main_vals = self.main_warehouse._prepare_vals_for_pos(self.product)
        extra_vals = self.extra_warehouse._prepare_vals_for_pos(self.product)

        self.assertEqual(main_vals["quantity"], 7.0)
        self.assertEqual(extra_vals["quantity"], 3.0)
        self.assertEqual(main_vals["product_id"], self.product.id)
        self.assertEqual(main_vals["product_tmpl_id"], self.product.product_tmpl_id.id)

    def test_product_template_process_pos_data_adds_all_warehouses(self):
        product_info = {
            "id": self.product.product_tmpl_id.id,
            "currency_id": self.company.currency_id.id,
            "taxes_id": [],
            "image_128": False,
            "list_price": 0.0,
            "standard_price": 0.0,
        }

        self.env["product.template"]._process_pos_ui_product_product(
            [product_info], self.config
        )

        self.assertEqual(
            [wh["id"] for wh in product_info["warehouse_info"]],
            [self.main_warehouse.id, self.extra_warehouse.id],
        )
        self.assertEqual(
            [wh["quantity"] for wh in product_info["warehouse_info"]],
            [7.0, 3.0],
        )

    def test_product_template_process_pos_data_skips_when_disabled(self):
        product_info = {
            "id": self.product.product_tmpl_id.id,
            "currency_id": self.company.currency_id.id,
            "taxes_id": [],
            "image_128": False,
            "list_price": 0.0,
            "standard_price": 0.0,
        }
        self.config.display_product_quantity = False

        self.env["product.template"]._process_pos_ui_product_product(
            [product_info], self.config
        )

        self.assertNotIn("warehouse_info", product_info)

    def test_product_info_pos_uses_configured_warehouses(self):
        product_info = self.product.product_tmpl_id.get_product_info_pos(
            1.0, 1.0, self.config.id, self.product.id
        )

        self.assertEqual(
            [wh["id"] for wh in product_info["warehouses"]],
            [self.main_warehouse.id, self.extra_warehouse.id],
        )
        self.assertEqual(
            [wh["free_qty"] for wh in product_info["warehouses"]],
            [7.0, 3.0],
        )
        self.assertEqual(
            [wh["available_quantity"] for wh in product_info["warehouses"]],
            [7.0, 3.0],
        )

    def test_product_info_pos_skips_when_disabled(self):
        self.config.display_product_quantity = False

        product_info = self.product.product_tmpl_id.get_product_info_pos(
            1.0, 1.0, self.config.id, self.product.id
        )

        self.assertIn("warehouses", product_info)

    def test_pos_config_load_pos_data_read_adds_custom_fields(self):
        data = self.config._load_pos_data_read(self.config, self.config)
        config_data = data[0]

        self.assertTrue(config_data["display_product_quantity"])
        self.assertEqual(config_data["minimum_product_quantity_alert"], 2.0)

    def test_pos_config_notify_available_quantity_sends_list_payload(self):
        with patch.object(type(self.config), "_notify", autospec=True) as notify:
            self.config._notify_available_quantity({"product_id": self.product.id})

        notify.assert_called_once_with(
            self.config,
            "PRODUCT_QUANTITY_UPDATE",
            [{"product_id": self.product.id}],
        )

    def test_pos_config_notify_available_quantity_keeps_list_payload(self):
        payload = [{"product_id": self.product.id}]

        with patch.object(type(self.config), "_notify", autospec=True) as notify:
            self.config._notify_available_quantity(payload)

        notify.assert_called_once_with(
            self.config,
            "PRODUCT_QUANTITY_UPDATE",
            payload,
        )

    def test_stock_quant_write_notifies_and_context_can_skip(self):
        quant = self.env["stock.quant"].search(
            [
                ("product_id", "=", self.product.id),
                ("location_id", "=", self.main_warehouse.lot_stock_id.id),
            ],
            limit=1,
        )

        with patch.object(type(quant), "_notify_pos", autospec=True) as notify:
            quant.write({"inventory_quantity": 7.0})

        notify.assert_called_once()
        self.assertFalse(quant._skip_notify_pos())
        self.assertTrue(
            quant.with_context(skip_quant_notify_pos=True)._skip_notify_pos()
        )
        self.assertIn(self.main_warehouse, quant._get_warehouses_to_notify())

    def test_stock_move_write_notifies_only_on_state_change(self):
        move = self.env["stock.move"].create(
            {
                "product_id": self.product.id,
                "product_uom_qty": 1.0,
                "product_uom": self.product.uom_id.id,
                "location_id": self.main_warehouse.lot_stock_id.id,
                "location_dest_id": self.extra_warehouse.lot_stock_id.id,
            }
        )

        with patch.object(type(move), "_notify_pos", autospec=True) as notify:
            move.write({"product_uom_qty": 2.0})
            self.assertFalse(notify.called)
            move.write({"state": "cancel"})
            self.assertTrue(notify.called)

        warehouses = move._get_warehouses_to_notify()
        self.assertIn(self.main_warehouse, warehouses)
        self.assertIn(self.extra_warehouse, warehouses)

    def test_stock_move_action_done_sets_skip_quant_notify_context(self):
        move = self.env["stock.move"].create(
            {
                "product_id": self.product.id,
                "product_uom_qty": 1.0,
                "product_uom": self.product.uom_id.id,
                "location_id": self.main_warehouse.lot_stock_id.id,
                "location_dest_id": self.extra_warehouse.lot_stock_id.id,
                "picked": True,
                "move_line_ids": [
                    (
                        0,
                        0,
                        {
                            "product_id": self.product.id,
                            "product_uom_id": self.product.uom_id.id,
                            "quantity": 1.0,
                            "location_id": self.main_warehouse.lot_stock_id.id,
                            "location_dest_id": self.extra_warehouse.lot_stock_id.id,
                            "picked": True,
                        },
                    )
                ],
            }
        )

        with patch.object(type(move), "_notify_pos", autospec=True):
            move._action_confirm()
            result = move._action_done()

        self.assertIn(move, result)
        self.assertEqual(move.state, "done")

    def test_notifier_pos_mixin_notify_pos(self):
        self.config.iface_available_categ_ids = False
        session = self.env["pos.session"].create({"config_id": self.config.id})
        session.state = "opened"
        quant = self.env["stock.quant"].search(
            [
                ("product_id", "=", self.product.id),
                ("location_id", "=", self.extra_warehouse.lot_stock_id.id),
            ],
            limit=1,
        )

        with patch.object(
            type(self.config), "_notify_available_quantity", autospec=True
        ) as notify:
            quant._notify_pos()

        self.assertTrue(notify.called)

    def test_notifier_pos_mixin_skip_notify_pos(self):
        quant = (
            self.env["stock.quant"]
            .search(
                [
                    ("product_id", "=", self.product.id),
                    ("location_id", "=", self.extra_warehouse.lot_stock_id.id),
                ],
                limit=1,
            )
            .with_context(skip_quant_notify_pos=True)
        )

        with patch.object(
            type(self.config), "_notify_available_quantity", autospec=True
        ) as notify:
            quant._notify_pos()

        self.assertFalse(notify.called)
