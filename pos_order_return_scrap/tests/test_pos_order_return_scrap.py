# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo.addons.pos_order_return.tests.test_pos_order_return import (
    TestPOSOrderReturn,
    tagged,
)


@tagged("post_install", "-at_install")
class TestPosOrderReturnScrap(TestPOSOrderReturn):
    def setUp(self):
        super().setUp()

        self.product_normal = self.env["product.product"].create(
            {
                "name": "Normal Product A",
                "is_storable": True,
            }
        )

        self.product_lot = self.env["product.product"].create(
            {
                "name": "Tracked by lot",
                "is_storable": True,
                "tracking": "lot",
            }
        )

        self.product_serial = self.env["product.product"].create(
            {
                "name": "Tracked by serial",
                "is_storable": True,
                "tracking": "serial",
            }
        )

        # Create lots / serials
        self.lot_1 = self.env["stock.lot"].create(
            {
                "name": "LOT-A",
                "product_id": self.product_lot.id,
            }
        )
        self.serial_1 = self.env["stock.lot"].create(
            {
                "name": "SN-001",
                "product_id": self.product_serial.id,
            }
        )
        wh_location = self.pos_config.picking_type_id.default_location_src_id
        shelf1_location = self.env["stock.location"].create(
            {
                "name": "shelf1",
                "usage": "internal",
                "location_id": wh_location.id,
            }
        )
        qty = 2
        # Tracked
        self.env["stock.quant"]._update_available_quantity(
            self.product_lot, shelf1_location, qty, lot_id=self.lot_1
        )
        # Untracked
        self.env["stock.quant"]._update_available_quantity(
            self.product_normal, shelf1_location, qty
        )

        self.pos_order = self.PosOrder.create(
            {
                "session_id": self.pos_config.current_session_id.id,
                "partner_id": self.partner.id,
                "pricelist_id": self.partner.property_product_pricelist.id,
                "amount_tax": 0,
                "amount_total": 1350,
                "amount_paid": 1350,
                "amount_return": 0,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "name": "POSLINE/0001",
                            "product_id": self.product_normal.id,
                            "price_unit": 225,
                            "price_subtotal": 450,
                            "price_subtotal_incl": 450,
                            "qty": 2.0,
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "name": "POSLINE/0002",
                            "product_id": self.product_lot.id,
                            "price_unit": 225,
                            "price_subtotal": 450,
                            "price_subtotal_incl": 450,
                            "qty": 2.0,
                            "pack_lot_ids": [
                                [0, 0, {"lot_name": self.lot_1.name}],
                            ],
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "name": "POSLINE/0003",
                            "product_id": self.product_serial.id,
                            "price_unit": 225,
                            "price_subtotal": 450,
                            "price_subtotal_incl": 450,
                            "qty": 1.0,
                            "pack_lot_ids": [
                                [0, 0, {"lot_name": self.serial_1.name}],
                            ],
                        },
                    ),
                ],
            }
        )
        pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(
                **{
                    "active_ids": [self.pos_order.id],
                    "active_id": self.pos_order.id,
                }
            )
            .create({})
        )
        pos_make_payment.with_context(active_id=self.pos_order.id).check()
        res = self.pos_order.action_pos_order_invoice()
        self.invoice = self.env["account.move"].browse(res["res_id"])

    def _return_line(self, order_line, qty, is_scrap=True):
        """Helper to prepare the wizard line dict"""
        return (
            0,
            0,
            {
                "order_line_id": order_line.id,
                "qty": qty,
                "is_scrap": is_scrap,
            },
        )

    def test_pos_order_partial_refund(self):
        partial_refund = (
            self.env["pos.partial.return.wizard"]
            .with_context(
                **{
                    "active_model": self.pos_order._name,
                    "active_ids": self.pos_order.ids,
                    "active_id": self.pos_order.id,
                }
            )
            .create({})
        )
        # Return just 1 item from line POSLINE/0001
        partial_refund.line_ids[0].qty = 1
        partial_refund.line_ids[0].is_scrap = True
        # Return 2 items from line POSLINE/0002
        partial_refund.line_ids[1].qty = 2
        partial_refund.line_ids[1].is_scrap = True
        # Return 1 item from line POSLINE/0003
        partial_refund.line_ids[2].qty = 1
        partial_refund.line_ids[2].is_scrap = True
        partial_refund.confirm()
        refund_order = self.pos_order.refund_order_ids
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 3)
        pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(
                **{
                    "active_ids": refund_order.ids,
                    "active_id": refund_order.id,
                }
            )
            .create({})
        )
        pos_make_payment.with_context(active_id=refund_order.id).check()
        self.assertEqual(len(refund_order.picking_ids), 1)

        # Validate: One scrap order per returned product line
        scrap_orders = self.env["stock.scrap"].search(
            [("picking_id", "=", refund_order.picking_ids[0].id)]
        )
        self.assertEqual(len(scrap_orders), len(self.pos_order.lines))

        # Validate each scrap line references the correct product
        returned_products = self.pos_order.lines.mapped("product_id")
        self.assertTrue(all(s.product_id in returned_products for s in scrap_orders))

        # 2 scraps done, 1 draft (not enough stock)
        done_scraps = scrap_orders.filtered(lambda s: s.state == "done")
        self.assertEqual(len(done_scraps), 2)
        self.assertEqual((scrap_orders - done_scraps).state, "draft")

        # return the correct Lot
        lot = done_scraps.mapped("lot_id")
        self.assertEqual(lot, self.lot_1)
