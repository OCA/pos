# Copyright 2017 Creu Blanca <https://creublanca.es/>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

import odoo
from odoo.tests import Form

from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@odoo.tests.tagged("post_install", "-at_install")
class TestSessionPayInvoice(TestPointOfSaleCommon):
    @classmethod
    def setUpClass(cls, chart_template_ref=None):
        super().setUpClass(chart_template_ref=chart_template_ref)
        cls.pos_config.cash_control = True

        account = cls.env["account.account"].create(
            {
                "code": "test_cash_pay_invoice",
                "company_id": cls.company.id,
                "name": "Test",
                "user_type_id": cls.env.ref("account.data_account_type_revenue").id,
                "reconcile": True,
            }
        )

        cls.invoice_out = cls.env["account.move"].create(
            {
                "company_id": cls.company.id,
                "partner_id": cls.partner1.id,
                "date": "2016-03-12",
                "invoice_date": "2016-03-12",
                "move_type": "out_invoice",
                "invoice_line_ids": [
                    0,
                    0,
                    {
                        "product_id": cls.product3.id,
                        "name": "Producto de prueba",
                        "account_id": account.id,
                        "quantity": 1.0,
                        "price_unit": 100.0,
                    },
                ],
            }
        )
        cls.invoice_out._onchange_invoice_line_ids()
        cls.invoice_out.action_post()
        cls.invoice_in = cls.env["account.move"].create(
            {
                "partner_id": cls.partner4.id,
                "company_id": cls.company.id,
                "move_type": "in_invoice",
                "date": "2016-03-12",
                "invoice_date": "2016-03-12",
                "invoice_line_ids": [
                    0,
                    0,
                    {
                        "product_id": cls.product3.id,
                        "name": "Producto de prueba",
                        "account_id": account.id,
                        "quantity": 1.0,
                        "price_unit": 100.0,
                    },
                ],
            }
        )
        cls.invoice_in._onchange_invoice_line_ids()
        cls.invoice_in.action_post()
        refund_wizard = (
            cls.env["account.move.reversal"]
            .with_context(
                active_ids=cls.invoice_out.ids,
                active_id=cls.invoice_out.id,
                active_model=cls.invoice_out._name,
            )
            .create({})
            .reverse_moves()
        )
        cls.refund = cls.env[refund_wizard["res_model"]].browse(refund_wizard["res_id"])
        cls.refund.action_post()

    def test_pos_in_invoice(self):
        self.assertEqual(self.invoice_in.amount_residual, 100.0)
        self.pos_config.open_session_cb()
        session = self.pos_config.current_session_id
        self.assertIsNotNone(session.statement_ids)
        cash_statements = session.statement_ids.filtered(
            lambda x: x.journal_id.type == "cash"
        )
        self.assertEqual(len(cash_statements), 1)
        session.action_pos_session_open()
        cash_in = self.env["cash.invoice.in"].with_context(
            active_ids=session.ids, active_model="pos.session"
        )
        with Form(cash_in) as form:
            form.invoice_id = self.invoice_in
            self.assertEqual(form.amount, -100)
        cash_in.browse(form.id).run()
        session.action_pos_session_closing_control()
        session._validate_session()
        session.flush()
        session.refresh()
        self.invoice_in.flush()
        self.invoice_in.refresh()
        self.invoice_in._compute_amount()
        self.assertEqual(self.invoice_in.amount_residual, 0.0)

    def test_pos_out_invoice(self):
        self.assertEqual(self.invoice_out.amount_residual, 100.0)
        self.pos_config.open_session_cb()
        session = self.pos_config.current_session_id
        out_invoice = self.env["pos.box.cash.invoice.out"].with_context(
            active_ids=session.ids,
            active_model="pos.session",
            default_session_id=session.id,
        )
        with Form(out_invoice) as form:
            form.move_id = self.invoice_out
            self.assertEqual(form.amount, 100)
            form.amount = 75
        out_invoice.browse(form.id).run()
        session.action_pos_session_closing_control()
        session._validate_session()
        session.flush()
        self.invoice_out.flush()
        self.invoice_out._compute_amount()
        self.assertEqual(self.invoice_out.amount_residual, 25.0)

    def test_pos_invoice_refund(self):
        self.assertEqual(self.refund.amount_residual, 100.0)
        self.pos_config.open_session_cb()
        session = self.pos_config.current_session_id
        in_invoice = self.env["pos.box.cash.invoice.in"].with_context(
            active_ids=session.ids,
            active_model="pos.session",
            default_session_id=session.id,
        )
        with Form(in_invoice) as form:
            form.move_id = self.refund
            self.assertEqual(form.amount, -100)
        in_invoice.browse(form.id).run()
        session.action_pos_session_closing_control()
        session._validate_session()
        session.flush()
        self.invoice_out.flush()
        self.refund.refresh()
        self.assertEqual(self.refund.amount_residual, 0.0)
