# Copyright 2022 KMEE - Gabriel Cardoso <gabriel.cardoso@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)

import odoo

from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPointOfSaleFlow(TestPointOfSaleCommon):
    def compute_tax(self, product, price, qty=1, taxes=None):
        if not taxes:
            taxes = product.taxes_id.filtered(
                lambda t: t.company_id.id == self.env.company.id
            )
        currency = self.pos_config.pricelist_id.currency_id
        res = taxes.compute_all(price, currency, qty, product=product)
        untax = res["total_excluded"]
        return untax, sum(tax.get("amount", 0.0) for tax in res["taxes"])

    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)

        cls.product12 = cls.env["product.product"].create(
            {
                "name": "Product 12",
                "type": "product",
                "available_in_pos": True,
                "route_ids": [
                    (
                        6,
                        0,
                        cls.env.ref("stock.route_warehouse0_mto").ids
                        + cls.env.ref("mrp.route_warehouse0_manufacture").ids,
                    )
                ],
                "list_price": 750,
            }
        )

        bom_id = cls.env["mrp.bom"].create(
            {
                "product_tmpl_id": cls.product12.product_tmpl_id.id,
                "product_uom_id": cls.env.ref("uom.product_uom_unit").id,
                "sequence": 10,
            }
        )

        cls.env["mrp.bom.line"].create(
            {
                "product_id": cls.product4.id,
                "product_qty": 1,
                "product_uom_id": cls.env.ref("uom.product_uom_unit").id,
                "sequence": 10,
                "bom_id": bom_id.id,
            }
        )

        cls.stock_location_components = cls.env["stock.location"].create(
            {
                "name": "Shelf 1",
                "location_id": cls.company_data["default_warehouse"].lot_stock_id.id,
            }
        )

        inventory = cls.env["stock.inventory"].create({"name": "Inventory adjustment"})
        cls.env["stock.inventory.line"].sudo().create(
            {
                "product_id": cls.product12.id,
                "inventory_id": inventory.id,
                "product_qty": 0,
                "location_id": cls.stock_location_components.id,
            }
        )
        inventory._action_start()
        inventory.action_validate()

    def test_order_to_picking(self):
        """
        In order to test the Point of Sale in module, I will do one order from the
        sale to the payment, and will check the picking consistency and the
        production order in the end.
        """

        # I click on create a new session button
        self.pos_config.open_session_cb(check_coa=False)
        current_session = self.pos_config.current_session_id

        # I create a PoS order with 2 units of PCSC234 at 450 EUR
        # and 3 units of PCSC349 at 300 EUR.
        untax12, atax12 = self.compute_tax(self.product12, 450, 20)
        untax1, atax1 = self.compute_tax(self.product3, 450, 20)
        untax2, atax2 = self.compute_tax(self.product4, 450, 20)
        self.pos_order_pos1 = self.PosOrder.create(
            {
                "company_id": self.env.company.id,
                "session_id": current_session.id,
                "pricelist_id": self.partner1.property_product_pricelist.id,
                "partner_id": self.partner1.id,
                "lines": [
                    (
                        0,
                        0,
                        {
                            "name": "OL/0001",
                            "product_id": self.product3.id,
                            "price_unit": 450,
                            "discount": 0.0,
                            "qty": 2.0,
                            "tax_ids": [(6, 0, self.product3.taxes_id.ids)],
                            "price_subtotal": untax1,
                            "price_subtotal_incl": untax1 + atax1,
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "name": "OL/0002",
                            "product_id": self.product4.id,
                            "price_unit": 450,
                            "discount": 0.0,
                            "qty": 3.0,
                            "tax_ids": [(6, 0, self.product4.taxes_id.ids)],
                            "price_subtotal": untax2,
                            "price_subtotal_incl": untax2 + atax2,
                        },
                    ),
                    (
                        0,
                        0,
                        {
                            "name": "OL/0002",
                            "product_id": self.product12.id,
                            "price_unit": 450,
                            "discount": 0.0,
                            "qty": 3.0,
                            "tax_ids": [(6, 0, self.product12.taxes_id.ids)],
                            "price_subtotal": untax12,
                            "price_subtotal_incl": untax12 + atax12,
                        },
                    ),
                ],
                "amount_tax": atax1 + atax2 + atax12,
                "amount_total": untax1 + untax2 + untax12 + atax1 + atax2 + atax12,
                "amount_paid": 0,
                "amount_return": 0,
            }
        )

        context_make_payment = {
            "active_ids": [self.pos_order_pos1.id],
            "active_id": self.pos_order_pos1.id,
        }
        self.pos_make_payment_2 = self.PosMakePayment.with_context(
            context_make_payment
        ).create({"amount": untax1 + untax2 + untax12 + atax1 + atax2 + atax12})

        # I click on the validate button to register the payment.
        context_payment = {"active_id": self.pos_order_pos1.id}

        self.pos_make_payment_2.with_context(context_payment).check()
        # I check that the order is marked as paid
        self.assertEqual(
            self.pos_order_pos1.state, "paid", "Order should be in paid state."
        )

        # I test that the pickings are created as expected during payment
        # One picking attached and having all the positive move lines in the correct state
        self.assertEqual(
            self.pos_order_pos1.picking_ids[0].state,
            "done",
            "Picking should be in done state.",
        )
        self.assertEqual(
            self.pos_order_pos1.picking_ids[0].move_lines.mapped("state"),
            ["done", "done", "done"],
            "Move Lines should be in done state.",
        )

        mrp_productions = (
            self.env["mrp.production"]
            .search([("origin", "=", self.pos_order_pos1.name)])
            .filtered(lambda production: production.state == "done")
        )

        self.assertEqual(
            len(mrp_productions), 1, "Generated wrong number of mrp orders."
        )
        self.assertEqual(
            mrp_productions[0].product_qty,
            3,
            "Production order created with wrong quantity.",
        )
        self.assertEqual(
            mrp_productions[0].qty_producing, 3, "Order produced with wrong quantity."
        )
