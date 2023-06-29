# Copyright 2018 Tecnativa - David Vidal
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo.tests import common, tagged


@tagged("post_install", "-at_install")
class TestPOSOrderReturn(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestPOSOrderReturn, cls).setUpClass()
        cls.pricelist = cls.env["product.pricelist"].create(
            {
                "name": "Test pricelist",
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "applied_on": "3_global",
                            "compute_price": "formula",
                            "base": "list_price",
                        },
                    )
                ],
            }
        )
        cls.partner = cls.env["res.partner"].create(
            {
                "name": "Mr. Odoo",
                "property_product_pricelist": cls.pricelist.id,
            }
        )
        cls.product_1 = cls.env["product.product"].create(
            {
                "name": "Test product 1",
                "standard_price": 1.0,
                "type": "product",
                "pos_allow_negative_qty": False,
                "taxes_id": False,
            }
        )
        cls.product_2 = cls.env["product.product"].create(
            {
                "name": "Test product 2",
                "standard_price": 1.0,
                "type": "product",
                "pos_allow_negative_qty": True,
                "taxes_id": False,
            }
        )
        cls.product_3 = cls.env["product.product"].create(
            {
                "name": "Test product 3",
                "standard_price": 1.0,
                "type": "product",
                "pos_allow_negative_qty": True,
                "taxes_id": False,
            }
        )
        cls.PosOrder = cls.env["pos.order"]
        cls.PosOrderLine = cls.env["pos.order.line"]
        cls.pos_config = cls.env.ref("point_of_sale.pos_config_main")
        cls.pos_config.write(
            {
                "available_pricelist_ids": [(6, 0, cls.pricelist.ids)],
                "pricelist_id": cls.pricelist.id,
            }
        )
        cls.pos_config.company_id.point_of_sale_update_stock_quantities = False
        cls.pos_config.open_session_cb()
        cls.pos_order = cls.PosOrder.create(
            {
                "session_id": cls.pos_config.current_session_id.id,
                "partner_id": cls.partner.id,
                "pricelist_id": cls.partner.property_product_pricelist.id,
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
                            "product_id": cls.product_1.id,
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
                            "product_id": cls.product_2.id,
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
                            "name": "POSLINE/0003",
                            "product_id": cls.product_1.id,
                            "price_unit": 225,
                            "price_subtotal": 450,
                            "price_subtotal_incl": 450,
                            "qty": 2.0,
                        },
                    ),
                ],
            }
        )
        pos_make_payment = (
            cls.env["pos.make.payment"]
            .with_context(
                {
                    "active_ids": [cls.pos_order.id],
                    "active_id": cls.pos_order.id,
                }
            )
            .create({})
        )
        pos_make_payment.with_context(active_id=cls.pos_order.id).check()
        res = cls.pos_order.action_pos_order_invoice()
        cls.invoice = cls.env["account.move"].browse(res["res_id"])

    def test_pos_order_full_refund(self):
        self.pos_order.refund()
        refund_order = self.pos_order.refund_order_ids
        self.assertEqual(len(refund_order), 1)
        pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(
                {
                    "active_ids": refund_order.ids,
                    "active_id": refund_order.id,
                }
            )
            .create({})
        )
        pos_make_payment.with_context(active_id=refund_order.id).check()
        refund_invoice = refund_order.account_move
        refund_order.action_pos_order_invoice()
        self.assertEqual(refund_invoice.reversed_entry_id, self.invoice)
        # Partner balance is 0
        self.assertEqual(sum(self.partner.mapped("invoice_ids.amount_total_signed")), 0)

    def test_pos_order_partial_refund(self):
        partial_refund = (
            self.env["pos.partial.return.wizard"]
            .with_context(
                {
                    "active_ids": self.pos_order.ids,
                    "active_id": self.pos_order.id,
                }
            )
            .create({})
        )
        # Return just 1 item from line POSLINE/0001
        partial_refund.line_ids[0].qty = 1
        # Return 2 items from line POSLINE/0003
        partial_refund.line_ids[1].qty = 2
        partial_refund.confirm()
        refund_order = self.pos_order.refund_order_ids
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 2)
        pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(
                {
                    "active_ids": refund_order.ids,
                    "active_id": refund_order.id,
                }
            )
            .create({})
        )
        pos_make_payment.with_context(active_id=refund_order.id).check()
        # Partner balance is 1350
        self.assertEqual(
            sum(self.partner.mapped("invoice_ids.amount_total_signed")), 675.0
        )

    def __new_sale(self, qty, lines_qty_to_return, new_product):
        partial_refund = (
            self.env["pos.partial.return.wizard"]
            .with_context(
                {
                    "active_ids": self.pos_order.ids,
                    "active_id": self.pos_order.id,
                }
            )
            .create({})
        )
        for line_index, return_qty in lines_qty_to_return:
            partial_refund.line_ids[line_index].qty = return_qty
        partial_refund.confirm()
        refund_order = self.pos_order.refund_order_ids
        # Customer exchanges 3 items for another product POSLINE/0004
        self.PosOrderLine.create(
            {
                "name": "POSLINE/0004",
                "order_id": refund_order.id,
                "product_id": new_product.id,
                "price_unit": 225,
                "price_subtotal": 225 * qty,
                "price_subtotal_incl": 225 * qty,
                "qty": qty,
            }
        )
        refund_order._onchange_amount_all()
        pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(
                {
                    "active_ids": refund_order.ids,
                    "active_id": refund_order.id,
                }
            )
            .create({})
        )
        pos_make_payment.with_context(active_id=refund_order.id).check()
        return refund_order

    def test_pos_order_full_refund_and_new_equal_sale(self):
        # The customer exchanges 3 items for the same quantity of another product.
        refund_order = self.__new_sale(
            3.0,
            [
                (0, 1.0),  # POSLINE/0001
                (2, 2.0),  # POSLINE/0003
            ],
            self.product_2,
        )
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 3)
        self.assertEqual(
            sum(self.partner.mapped("invoice_ids.amount_total_signed")), 1350.0
        )

    def test_pos_order_full_refund_and_new_lower_sale(self):
        # Customer exchanges 3 items for 2 of another product
        refund_order = self.__new_sale(
            2.0,
            [
                (0, 1.0),  # POSLINE/0001
                (2, 2.0),  # POSLINE/0003
            ],
            self.product_2,
        )
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 3)
        self.assertEqual(
            sum(self.partner.mapped("invoice_ids.amount_total_signed")), 1125.0
        )

    def test_pos_order_full_refund_and_new_higher_sale(self):
        # Customer exchanges 3 items for 4 of another product.
        refund_order = self.__new_sale(
            4.0,
            [
                (0, 1.0),  # POSLINE/0001
                (2, 2.0),  # POSLINE/0003
            ],
            self.product_2,
        )
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 3)
        self.assertEqual(
            sum(self.partner.mapped("invoice_ids.amount_total_signed")), 1575.0
        )

    def test_pos_order_several_refund_and_new_sale(self):
        # The customer refund an order placed through a previous refund.
        refund_order = self.__new_sale(
            3.0,
            [
                (0, 1.0),  # POSLINE/0001
                (2, 2.0),  # POSLINE/0003
            ],
            self.product_2,
        )
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 3)
        self.pos_order = self.PosOrder.search([], limit=1, order="id desc")
        refund_order = self.__new_sale(
            5.0,
            [
                (2, 3.0),  # POSLINE/0004
            ],
            self.product_3,
        )
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 2)
        self.assertEqual(
            sum(self.partner.mapped("invoice_ids.amount_total_signed")), 1800.0
        )
