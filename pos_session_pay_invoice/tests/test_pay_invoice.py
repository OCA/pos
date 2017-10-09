# -*- coding: utf-8 -*-
# Copyright 2017 Creu Blanca <https://creublanca.es/>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo.tests import common


class TestSessionPayInvoice(common.TransactionCase):
    def setUp(self):
        super(TestSessionPayInvoice, self).setUp()
        self.company = self.env.ref('base.main_company')
        partner = self.env.ref('base.partner_demo')
        self.invoice_out = self.env['account.invoice'].create({
            'company_id': self.company.id,
            'partner_id': partner.id,
            'date_invoice': '2016-03-12',
            'type': 'out_invoice',
        })
        account = self.env['account.account'].create({
            'code': 'test_cash_pay_invoice',
            'company_id': self.company.id,
            'name': 'Test',
            'user_type_id': self.env.ref(
                'account.data_account_type_revenue').id
        })
        self.env['account.invoice.line'].create({
            'product_id': self.env.ref('product.product_delivery_02').id,
            'invoice_id': self.invoice_out.id,
            'account_id': account.id,
            'name': 'Producto de prueba',
            'quantity': 1.0,
            'price_unit': 100.0,
        })
        self.invoice_out._onchange_invoice_line_ids()
        self.invoice_out.action_invoice_open()
        self.invoice_out.number = '2999/99999'
        self.invoice_in = self.env['account.invoice'].create({
            'partner_id': partner.id,
            'company_id': self.company.id,
            'type': 'in_invoice',
            'date_invoice': '2016-03-12',
        })
        self.env['account.invoice.line'].create({
            'product_id': self.env.ref('product.product_delivery_02').id,
            'invoice_id': self.invoice_in.id,
            'name': 'Producto de prueba',
            'account_id': account.id,
            'quantity': 1.0,
            'price_unit': 100.0,
        })
        self.invoice_in._onchange_invoice_line_ids()
        self.invoice_in.action_invoice_open()
        self.invoice_in.number = '2999/99999'
        self.config = self.env.ref('point_of_sale.pos_config_main')
        self.config.cash_control = True

        self.account_cash_differences_id = self.env['account.account'].create({
            'code': 'test_cash_differences',
            'company_id': self.company.id,
            'name': 'Test Cash Differences',
            'user_type_id': self.env.ref(
                'account.data_account_type_revenue').id
        })

    def test_pos_invoice(self):
        self.config.open_session_cb()
        session = self.config.current_session_id
        self.assertIsNotNone(session.statement_ids)
        cash_statements = session.statement_ids.filtered(
            lambda x: x.journal_id.type == 'cash')
        self.assertEquals(len(cash_statements), 1)
        journal = cash_statements[0].journal_id
        journal.profit_account_id = self.account_cash_differences_id
        journal.loss_account_id = self.account_cash_differences_id

        session.action_pos_session_open()
        in_invoice = self.env['cash.invoice.in'].with_context(
            active_ids=session.ids, active_model='pos.session'
        ).create({
            'invoice_id': self.invoice_in.id,
            'amount': 100.0
        })
        in_invoice.run()
        out_invoice = self.env['cash.invoice.out'].with_context(
            active_ids=session.ids, active_model='pos.session'
        ).create({
            'invoice_id': self.invoice_out.id,
            'amount': 75.0
        })
        out_invoice.run()
        box = self.env['cash.box.in'].with_context(
            active_ids=session.ids, active_model='pos.session'
        ).create({
            'name': "Testing",
            'amount': 25.0
        })
        box.run()
        session.action_pos_session_closing_control()
        session.action_pos_session_validate()
        self.assertEqual(self.invoice_out.residual, 25.)
        self.assertEqual(self.invoice_in.residual, 0.)
