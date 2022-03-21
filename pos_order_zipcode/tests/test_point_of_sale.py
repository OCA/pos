# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
import odoo
from odoo import fields
from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPointOfSaleOrderZipCode(TestPointOfSaleCommon):
    def compute_tax(self, product, price, qty=1, taxes=None):
        if not taxes:
            taxes = product.taxes_id.filtered(
                lambda t: t.company_id.id == self.env.user.id
            )
        currency = self.pos_config.pricelist_id.currency_id
        res = taxes.compute_all(price, currency, qty, product=product)
        untax = res["total_excluded"]
        return untax, sum(tax.get("amount", 0.0) for tax in res["taxes"])

    def test_create_from_ui(self):
        """
        Simulation of sales coming from the interface
        """

        # I click on create a new session button
        ZIPCODE = "2A"
        self.pos_config.open_session_cb()

        current_session = self.pos_config.current_session_id

        untax, atax = self.compute_tax(self.led_lamp, 0.9)
        account_receivable_id = (
            self.env.user.partner_id.property_account_receivable_id.id
        )
        carrot_order = {
            "data": {
                "zipcode": ZIPCODE,
                "amount_paid": untax + atax,
                "amount_return": 0,
                "amount_tax": atax,
                "amount_total": untax + atax,
                "creation_date": fields.Datetime.to_string(fields.Datetime.now()),
                "fiscal_position_id": False,
                "pricelist_id": self.pos_config.available_pricelist_ids[0].id,
                "lines": [
                    [
                        0,
                        0,
                        {
                            "discount": 0,
                            "id": 42,
                            "pack_lot_ids": [],
                            "price_unit": 0.9,
                            "product_id": self.led_lamp.id,
                            "price_subtotal": 0.9,
                            "price_subtotal_incl": 1.04,
                            "qty": 1,
                            "tax_ids": [(6, 0, self.led_lamp.taxes_id.ids)],
                        },
                    ]
                ],
                "name": "Order 00042-003-0014",
                "partner_id": False,
                "pos_session_id": current_session.id,
                "sequence_number": 2,
                "statement_ids": [
                    [
                        0,
                        0,
                        {
                            "account_id": account_receivable_id,
                            "amount": untax + atax,
                            "journal_id": self.pos_config.journal_ids[0].id,
                            "name": fields.Datetime.now(),
                            "statement_id": current_session.statement_ids[0].id,
                        },
                    ]
                ],
                "uid": "00042-003-0014",
                "user_id": self.env.uid,
            },
            "id": "00042-003-0014",
            "to_invoice": False,
        }

        # I create an order on an open session
        pos_order = self.PosOrder.browse(self.PosOrder.create_from_ui([carrot_order]))
        self.assertEqual(pos_order.zipcode, ZIPCODE)
