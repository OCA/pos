import odoo

from odoo.addons.point_of_sale.tests.common import TestPoSCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosOrder(TestPoSCommon):
    @classmethod
    def setUpClass(cls):
        super(TestPosOrder, cls).setUpClass()

        cls.config = cls.basic_config
        cls.product0 = cls.create_product("Product 0", cls.categ_basic, 0.0, 0.0)
        cls.product1 = cls.create_product("Product 1", cls.categ_basic, 10.0, 5)
        cls.product2 = cls.create_product("Product 2", cls.categ_basic, 20.0, 10)
        cls.adjust_inventory([cls.product0, cls.product1, cls.product2], [100, 50, 50])

        cls.sale_order_id = cls.env["sale.order"].create(
            {"partner_id": cls.customer.id}
        )
        cls.config.down_payment_product_id = cls.product2.id

    def test_order_creation(self):
        self.open_new_session()

        orders = []
        orders.append(
            self.create_ui_order_data([(self.product0, 10), (self.product1, 5)])
        )
        orders.append(self.create_ui_order_data([(self.product2, 7)]))

        for line in orders[1]["data"]["lines"]:
            line[2]["sale_order_origin_id"] = self.sale_order_id.read(fields=["name"])[
                0
            ]

        res = self.env["pos.order"].create_from_ui(orders)
        order = self.env["pos.order"].browse(res[0].get("id"))

        line_with_down_payment = order.lines.filtered(
            lambda l: l.product_id == self.config.down_payment_product_id
        )

        self.assertEqual(order.sale_order_count, 1)
        self.assertEqual(
            line_with_down_payment.sale_order_origin_id, self.sale_order_id
        )

        export = line_with_down_payment._export_for_ui(line_with_down_payment)
        self.assertEqual(export["sale_order_origin_id"]["id"], self.sale_order_id.id)

        self.assertEqual(self.sale_order_id.pos_order_count, 1)

        sale_line_id = line_with_down_payment.sale_order_line_id
        self.assertIsNotNone(sale_line_id)
        self.assertIsNotNone(sale_line_id.move_ids)
        self.assertTrue(sale_line_id.is_downpayment)

        sale_line_id.unlink()
        self.assertIsNotNone(sale_line_id)

        sale_line_id._compute_qty_invoiced()
        self.assertEqual(sale_line_id.qty_invoiced, 7)

        converted = sale_line_id.read_converted()
        self.assertTrue(isinstance(converted, list))
        self.assertEqual(len(converted), 1)

        self.assertEqual(
            converted[0]["product_uom_qty"],
            sale_line_id._convert_qty(
                sale_line_id, sale_line_id.product_uom_qty, "s2p"
            ),
        )

        self.assertEqual(
            converted[0]["qty_delivered"],
            sale_line_id._convert_qty(sale_line_id, sale_line_id.qty_delivered, "s2p"),
        )

        self.assertEqual(
            converted[0]["qty_invoiced"],
            sale_line_id._convert_qty(sale_line_id, sale_line_id.qty_invoiced, "s2p"),
        )

        self.assertEqual(
            converted[0]["qty_to_invoice"],
            sale_line_id._convert_qty(sale_line_id, sale_line_id.qty_to_invoice, "s2p"),
        )

        self.assertEqual(
            converted[0]["price_unit"],
            sale_line_id._convert_qty(sale_line_id, sale_line_id.price_unit, "s2p"),
        )
