from odoo.tests.common import SavepointCase


class TestPosCashMoveReason(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))
        cls.partner_01 = cls.env["res.partner"].create({"name": "Test partner 1"})
        cls.product_1 = cls.env["product.product"].create(
            {
                "name": "Test product 1",
                "standard_price": 1.0,
                "type": "product",
                "pos_allow_negative_qty": False,
                "taxes_id": False,
                "tracking": "lot",
            }
        )
        cls.sale_order_id = cls.env["sale.order"].create(
            {
                "partner_id": cls.partner_01.id,
            }
        )
        cls.sol_product_order = cls.env["sale.order.line"].create(
            {
                "name": cls.product_1.name,
                "product_id": cls.product_1.id,
                "product_uom_qty": 2,
                "product_uom": cls.product_1.uom_id.id,
                "price_unit": cls.product_1.list_price,
                "order_id": cls.sale_order_id.id,
                "tax_id": False,
            }
        )

    def test_convert_qty(self):
        qty = 3
        direction_s2p = "s2p"
        res_s2p = self.sale_order_id.order_line._convert_qty(
            self.sale_order_id.order_line, qty, direction_s2p
        )
        self.assertEqual(
            qty,
            res_s2p,
        )

        direction_p2s = "p2s"
        res_p2s = self.sale_order_id.order_line._convert_qty(
            self.sale_order_id.order_line, qty, direction_p2s
        )
        self.assertEqual(
            qty,
            res_p2s,
        )

    def test_read_converted(self):
        res = self.sale_order_id.order_line.read_converted()
        item = res[0]
        assert len(item["lot_names"]) == 0
        assert len(item["tax_id"]) == 0

        self.assertEqual(
            1.0,
            item["price_unit"],
        )
        self.assertEqual(
            2.0,
            item["product_uom_qty"],
        )
        self.assertEqual(
            0.0,
            item["qty_delivered"],
        )
        self.assertEqual(
            0.0,
            item["qty_invoiced"],
        )
        self.assertEqual(
            0.0,
            item["discount"],
        )
        self.assertEqual(
            0.0,
            item["qty_to_invoice"],
        )
        self.assertEqual(
            2.0,
            item["price_total"],
        )
