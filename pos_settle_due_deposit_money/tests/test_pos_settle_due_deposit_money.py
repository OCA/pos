# Copyright 2026 Jarsa
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import odoo.tests

from odoo.addons.point_of_sale.tests.test_frontend import TestPointOfSaleHttpCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestPosSettleDueDepositMoney(TestPointOfSaleHttpCommon):
    def test_deposit_money_with_due_invoice(self):
        partner = self.env["res.partner"].create({"name": "C Partner"})
        invoice = self.env["account.move"].create(
            {
                "partner_id": partner.id,
                "move_type": "out_invoice",
                "invoice_line_ids": [(0, 0, {"name": "test", "price_unit": 100})],
            }
        )
        invoice.action_post()
        self.assertEqual(partner.total_due, 100)
        customer_account_pm = self.env["pos.payment.method"].create(
            {
                "name": "Customer Account",
                "split_transactions": True,
            }
        )
        self.main_pos_config.write(
            {"payment_method_ids": [(4, customer_account_pm.id)]}
        )
        self.main_pos_config.open_ui()
        self.start_tour(
            "/pos/ui?config_id=%d" % self.main_pos_config.id,
            "pos_settle_due_deposit_money_tour",
            login="accountman",
        )
