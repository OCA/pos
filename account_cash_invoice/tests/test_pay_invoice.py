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
        self.journal = self.env['account.journal'].search([
            ('company_id', '=', self.company.id),
            ('type', '=', 'cash')
        ], limit=1).ensure_one()

    def test_bank_statement(self):
        statement = self.env['account.bank.statement'].create({
            'name': 'Statment',
            'journal_id': self.journal.id
        })
        in_invoice = self.env['cash.invoice.in'].with_context(
            active_ids=statement.ids, active_model='account.bank.statement'
        ).create({
            'invoice_id': self.invoice_in.id,
            'amount': 100.0
        })
        in_invoice.run()
        out_invoice = self.env['cash.invoice.out'].with_context(
            active_ids=statement.ids, active_model='account.bank.statement'
        ).create({
            'invoice_id': self.invoice_out.id,
            'amount': 100.0
        })
        out_invoice.run()
        statement.balance_end_real = statement.balance_start
        statement.check_confirm_bank()
        self.assertEqual(self.invoice_out.residual, 0.)
        self.assertEqual(self.invoice_in.residual, 0.)
