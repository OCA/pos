# Copyright 2025 APSL-Nagarro Antoni Marroig
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


from odoo.tests import tagged
from odoo.tests.common import TransactionCase

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@tagged("post_install", "-at_install")
class TestUi(TestPointOfSaleHttpCommon):
    def test_pos_order_to_sale_order(self):
        self.config = self.env["pos.config"].search(
            [("company_id", "=", self.env.company.id)]
        )
        self.config.open_ui()
        self.start_tour(
            f"/pos/ui?config_id={self.config.id}",
            "CreateRmaFromPosTour",
            login="accountman",
        )


class TestPosRMA(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.config = cls.env.ref("point_of_sale.pos_config_main")
        cls.session_id = cls.env["pos.session"].create(
            [
                {
                    "config_id": cls.config.id,
                    "user_id": cls.env.ref("base.user_admin").id,
                }
            ]
        )
        cls.partner = cls.env["res.partner"].create({"name": "Test Partner"})
        cls.product = cls.env["product.product"].create({"name": "Test Product"})
        cls.pos_order = cls.env["pos.order"].create(
            {
                "partner_id": cls.partner.id,
                "name": "Test Order",
                "session_id": cls.session_id.id,
                "company_id": cls.env.company.id,
                "amount_tax": 50.0,
                "amount_total": 50.0,
                "amount_paid": 50.0,
                "amount_return": 0.0,
            }
        )
        cls.pos_order_line = cls.env["pos.order.line"].create(
            {
                "order_id": cls.pos_order.id,
                "product_id": cls.product.id,
                "qty": 5,
                "price_unit": 10,
                "price_subtotal": 50.0,
                "price_subtotal_incl": 50.0,
            }
        )
        cls.rma = cls.env["rma"].create(
            {
                "partner_id": cls.partner.id,
                "product_id": cls.product.id,
                "product_uom_qty": 2,
                "description": "Test RMA",
                "pos_order_id": cls.pos_order.id,
            }
        )

    def test_compute_rma_count(self):
        self.pos_order._compute_rma_count()
        self.assertEqual(self.pos_order.rma_count, 1)

    def test_action_view_repair_rmas(self):
        action = self.pos_order.action_view_repair_rmas()
        self.assertEqual(action["res_model"], "rma")
        self.assertEqual(action["domain"], [("id", "in", self.pos_order.rma_ids.ids)])

    def test_create_rma_from_pos(self):
        self.env["rma"].create_rma_from_pos(self.pos_order_line.id, 3, "Test note")
        rma = self.env["rma"].search(
            [
                ("pos_order_id", "=", self.pos_order.id),
                ("description", "=", "Test note"),
            ],
            limit=1,
        )
        self.assertTrue(rma)
        self.assertEqual(rma.product_uom_qty, 3)

    def test_check_can_create_rma_true(self):
        result = self.env["rma"].check_can_create_rma(self.pos_order_line.id)
        self.assertTrue(result)

    def test_check_can_create_rma_false(self):
        self.env["rma"].create(
            {
                "partner_id": self.partner.id,
                "product_id": self.product.id,
                "product_uom_qty": 5,
                "pos_order_id": self.pos_order.id,
            }
        )
        result = self.env["rma"].check_can_create_rma(self.pos_order_line.id)
        self.assertFalse(result)
