# Copyright 2017 Creu Blanca <https://creublanca.es/>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo.tests.common import SavepointCase


class TestSessionPayInvoice(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env = cls.env(context=dict(cls.env.context, tracking_disable=True))
        cls.company = cls.env.ref("base.main_company")
        partner = cls.env.ref("base.partner_demo")
        cls.invoice_out = cls.env["account.move"].create(
            {
                "company_id": cls.company.id,
                "partner_id": partner.id,
                "date_invoice": "2016-03-12",
                "type": "out_invoice",
            }
        )
        account = cls.env["account.account"].create(
            {
                "code": "test_cash_pay_invoice",
                "company_id": cls.company.id,
                "name": "Test",
                "user_type_id": cls.env.ref("account.data_account_type_revenue").id,
            }
        )
        cls.env["account.move.line"].create(
            {
                "product_id": cls.env.ref("product.product_delivery_02").id,
                "invoice_id": cls.invoice_out.id,
                "account_id": account.id,
                "name": "Producto de prueba",
                "quantity": 1.0,
                "price_unit": 100.0,
            }
        )
        cls.invoice_out._onchange_invoice_line_ids()
        cls.invoice_out.action_invoice_open()
        cls.invoice_out.number = "2999/99999"
        cls.invoice_in = cls.env["account.move"].create(
            {
                "partner_id": partner.id,
                "company_id": cls.company.id,
                "type": "in_invoice",
                "date_invoice": "2016-03-12",
            }
        )
        cls.env["account.move.line"].create(
            {
                "product_id": cls.env.ref("product.product_delivery_02").id,
                "invoice_id": cls.invoice_in.id,
                "name": "Producto de prueba",
                "account_id": account.id,
                "quantity": 1.0,
                "price_unit": 100.0,
            }
        )
        cls.invoice_in._onchange_invoice_line_ids()
        cls.invoice_in.action_invoice_open()
        cls.invoice_in.number = "2999/99999"
        cls.config = cls.env.ref("point_of_sale.pos_config_main")
        cls.config.cash_control = True

        cls.account_cash_differences_id = cls.env["account.account"].create(
            {
                "code": "test_cash_differences",
                "company_id": cls.company.id,
                "name": "Test Cash Differences",
                "user_type_id": cls.env.ref("account.data_account_type_revenue").id,
            }
        )

    def test_pos_invoice(self):
        self.config.open_session_cb()
        session = self.config.current_session_id
        self.assertIsNotNone(session.statement_ids)
        cash_statements = session.statement_ids.filtered(
            lambda x: x.journal_id.type == "cash"
        )
        self.assertEquals(len(cash_statements), 1)
        journal = cash_statements[0].journal_id
        journal.profit_account_id = self.account_cash_differences_id
        journal.loss_account_id = self.account_cash_differences_id

        session.action_pos_session_open()
        in_invoice = (
            self.env["cash.invoice.in"]
            .with_context(active_ids=session.ids, active_model="pos.session")
            .create({"invoice_id": self.invoice_in.id, "amount": 100.0})
        )
        in_invoice.run()
        out_invoice = (
            self.env["cash.invoice.out"]
            .with_context(active_ids=session.ids, active_model="pos.session")
            .create({"invoice_id": self.invoice_out.id, "amount": 75.0})
        )
        out_invoice.run()
        box = (
            self.env["cash.box.in"]
            .with_context(active_ids=session.ids, active_model="pos.session")
            .create({"name": "Testing", "amount": 25.0})
        )
        box.run()
        session.action_pos_session_closing_control()
        session.action_pos_session_validate()
        self.assertEqual(self.invoice_out.residual, 25.0)
        self.assertEqual(self.invoice_in.residual, 0.0)
