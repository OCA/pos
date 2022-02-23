# Copyright 2018 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import common


@common.at_install(False)
@common.post_install(True)
class TestPointOfSaleStockPickingInvoiceLink(common.HttpCase):
    def setUp(self):
        super(TestPointOfSaleStockPickingInvoiceLink, self).setUp()
        self.partner = self.env["res.partner"].create({"name": "Mr. Odoo"})
        self.product_1 = self.env["product.product"].create(
            {"name": "Test variant 1", "standard_price": 1.0, "type": "product"}
        )
        self.product_2 = self.env["product.product"].create(
            {"name": "Test variant 1", "standard_price": 1.0, "type": "product"}
        )
        self.pricelist = self.env["product.pricelist"].create(
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
        self.PosOrder = self.env["pos.order"]
        self.pos_config = self.env.ref("point_of_sale.pos_config_main")
        journal = self.env["account.journal"].create(
            {
                "name": "Test journal sale",
                "code": "TST-JRNL-S",
                "type": "sale",
                "company_id": self.env.company.id,
            }
        )
        self.pos_config.write(
            {
                "available_pricelist_ids": [(6, 0, self.pricelist.ids)],
                "pricelist_id": self.pricelist.id,
                "module_account": True,
                "invoice_journal_id": journal.id,
            }
        )

    def test_stock_picking_invoice_link(self):
        """The picking is created and the lines are related to their moves"""
        self.pos_config.open_session_cb()
        pos_order = self.PosOrder.create(
            {
                "session_id": self.pos_config.current_session_id.id,
                "partner_id": self.partner.id,
                "pricelist_id": self.partner.property_product_pricelist.id,
                "amount_tax": 0,
                "amount_total": 2700,
                "amount_paid": 2700,
                "amount_return": 0,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "name": "POSLINE/0001",
                            "product_id": self.product_1.id,
                            "price_unit": 450,
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
                            "product_id": self.product_2.id,
                            "price_unit": 450,
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
                            "product_id": self.product_1.id,
                            "price_unit": 450,
                            "price_subtotal": 450,
                            "price_subtotal_incl": 450,
                            "qty": 2.0,
                        },
                    ),
                ],
            }
        )
        context_make_payment = {
            "active_ids": [pos_order.id],
            "active_id": pos_order.id,
        }
        pos_make_payment = (
            self.env["pos.make.payment"]
            .with_context(context_make_payment)
            .create({"amount": 950})
        )
        context_payment = {"active_id": pos_order.id}
        pos_make_payment.with_context(context_payment).check()
        pos_order.create_picking()
        res = pos_order.action_pos_order_invoice()
        invoice = self.env["account.move"].browse(res["res_id"])
        self.assertTrue(invoice.picking_ids)
        for line in invoice.invoice_line_ids:
            self.assertEqual(len(line.move_line_ids), 1)
