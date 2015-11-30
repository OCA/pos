# -*- coding: utf-8 -*-
# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests import common


class TestPosAnalyticConfig(common.TransactionCase):

    def setUp(self):
        super(TestPosAnalyticConfig, self).setUp()
        self.pos_order_obj = self.env['pos.order']
        self.pos_conig_obj = self.env['pos.config']
        self.pos_session_obj = self.env['pos.session']
        self.aml_obj = self.env['account.move.line']
        self.inv_line_obj = self.env['account.invoice.line']
        self.main_config = self.env.ref('point_of_sale.pos_config_main')
        self.aa_01 = self.env.ref('account.analytic_root')
        self.customer_01 = self.env.ref('base.res_partner_2')
        self.product_01 =\
            self.env.ref('point_of_sale.perrier_50cl')
        self.payment_method_01 = self.env.ref('account.bank_journal')
        self.aml_analytic_domain =\
            [('product_id', '=', self.product_01.id),
             ('analytic_account_id', '=', self.aa_01.id)]
        self.inv_analytic_domain =\
            [('product_id', '=', self.product_01.id),
             ('account_analytic_id', '=', self.aa_01.id)]

    def common_test(self):
        self.main_config.account_analytic_id = self.aa_01
        # I create and open a new session
        self.session_01 = self.pos_session_obj.create(
            {'config_id': self.main_config.id})
        ctx = self.env.context.copy()
        # context is updated in open_cb
        # -> Need to call with old api to give unfrozen context
        self.registry['pos.session'].open_cb(
            self.cr, self.uid, [self.session_01.id], context=ctx)
        # I create a new order
        order_vals = {
            'session_id': self.session_01.id,
            'partner_id': self.customer_01.id,
            'lines': [(0, 0, {'product_id': self.product_01.id,
                              'price_unit': 10.0,
                              })]
        }
        self.order_01 = self.pos_order_obj.create(order_vals)
        # I pay the created order
        payment_data = {'amount': 10,
                        'journal': self.payment_method_01.id}
        self.pos_order_obj.add_payment(self.order_01.id, payment_data)
        if self.order_01.test_paid():
            self.order_01.signal_workflow('paid')

    def test_order_simple_receipt(self):
        self.common_test()
        aml = self.aml_obj.search(self.aml_analytic_domain)
        # I check that there isn't lines with the analytic account in this test
        self.assertEqual(len(aml.ids), 0)
        self.session_01.signal_workflow('close')
        # I check that there is a journal item with the config analytic account
        aml = self.aml_obj.search(self.aml_analytic_domain)
        self.assertEqual(len(aml.ids), 1)

    def test_order_invoice(self):
        self.common_test()
        lines = self.inv_line_obj.search(self.inv_analytic_domain)
        self.order_01.action_invoice()
        # I check that there isn't lines with the analytic account in this test
        self.assertEqual(len(lines.ids), 0)
        lines = self.inv_line_obj.search(self.inv_analytic_domain)
        # I check that there is an invoice line
        # with the config analytic account
        self.assertEqual(len(lines.ids), 1)
