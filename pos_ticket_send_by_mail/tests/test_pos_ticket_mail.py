from odoo.tests.common import TransactionCase
from odoo import fields


class PosTicketMailTest(TransactionCase):

    def setUp(self):
        super(PosTicketMailTest, self).setUp()

        self.ir_config_parameter = self.env['ir.config_parameter'].sudo()
        self.PosOrder = self.env['pos.order']
        self.partner1 = self.env.ref('base.res_partner_1')
        self.posconfig = self.env['pos.config']
        self.pos_config = self.posconfig.search([
            ('name', '=', 'test_pos_email')
        ], limit=1)
        if not self.pos_config:
            self.pos_config = self.posconfig.create({
                'name': 'test_pos_email',
            })
        self.res_users = self.env['res.users']
        self.pos_user = self.res_users.search([
            ('login', '=', 'pos_test_email')
        ], limit=1)
        if not self.pos_user:
            self.pos_user = self.res_users.create({
                'name': 'pos_test_email',
                'login': 'pos_test_email',
                'email': 'pos_test_email@mail.com'
            })
        self.pos_session = self.env['pos.session']
        self.PosSession = self.pos_session.search([
            ('user_id', '=', self.pos_user.id)
        ], limit=1)
        if not self.PosSession:
            self.PosSession = self.env['pos.session'].create({
                'user_id': self.pos_user.id,
                'config_id': self.pos_config.id
            })
        self.led_lamp = self.env.ref('point_of_sale.led_lamp')
        self.whiteboard_pen = self.env.ref('point_of_sale.whiteboard_pen')
        self.newspaper_rack = self.env.ref('point_of_sale.newspaper_rack')
        self.partner_3 = self.env.ref('base.res_partner_3')
        self.pos_sale_journal = self.env['account.journal'].search([
            ('type', '=', 'cash')
        ])
        self.pos_config.journal_ids = [self.pos_sale_journal[0].id]

    def test_01_pos_config_no_mail_sent(self):
        """
            POS config do not send email
        """
        def compute_tax(product, price, qty=1, taxes=None):
            if not taxes:
                taxes = product.taxes_id.filtered(
                    lambda t: t.company_id.id == self.env.user.id)
            currency = self.pos_config.pricelist_id.currency_id
            res = taxes.compute_all(price, currency, qty, product=product)
            untax = res['total_excluded']
            return untax, sum(tax.get('amount', 0.0) for tax in res['taxes'])
        self.ir_config_parameter.set_param('point_of_sale.receipt_options',
                                           '1')
        open_session = self.PosSession.search([
            ('state', '!=', 'closed'),
            ('config_id', '=', self.pos_config.id),
            ('rescue', '=', False)
        ])
        if open_session:
            current_session = open_session
        else:
            self.pos_config.open_session_cb()
            current_session = self.pos_config.current_session_id
        untax, atax = compute_tax(self.led_lamp, 0.9)
        carrot_order = {
            'data': {
                'amount_paid': untax + atax,
                'amount_return': 0,
                'amount_tax': atax,
                'amount_total': untax + atax,
                'creation_date': fields.Datetime.to_string(
                    fields.Datetime.now()
                ),
                'fiscal_position_id': False,
                'pricelist_id': self.pos_config.available_pricelist_ids[0].id,
                'lines': [[0, 0, {
                    'discount': 0,
                    'id': 42,
                    'pack_lot_ids': [],
                    'price_unit': 0.9,
                    'product_id': self.led_lamp.id,
                    'price_subtotal': 0.9,
                    'price_subtotal_incl': 1.04,
                    'qty': 1,
                    'tax_ids': [(6, 0, self.led_lamp.taxes_id.ids)]}]],
                'name': 'Order 00042-003-0014',
                'partner_id': False,
                'pos_session_id': current_session.id,
                'sequence_number': 2,
                'statement_ids': [[0, 0, {
                    'account_id': self.env.user.partner_id.
                        property_account_receivable_id.id,
                    'amount': untax + atax,
                    'journal_id': self.pos_sale_journal[0].id,
                    'name': fields.Datetime.now(),
                    'statement_id': current_session.statement_ids[0].id}]],
                'uid': '00042-003-0014',
                'user_id': self.env.uid
            },
            'id': '00042-003-0014',
            'to_invoice': False
        }
        untax, atax = compute_tax(self.whiteboard_pen, 1.2)
        self.PosOrder01 = self.PosOrder.browse(
            self.PosOrder.create_from_ui([carrot_order]))
        self.PosOrder01.action_pos_order_paid()
        current_session.action_pos_session_closing_control()

    def test_02_pos_config_mail_sent_print_no_partner(self):
        """
            POS config Email receipt and print it
            No Partner
        """
        def compute_tax(product, price, qty=1, taxes=None):
            if not taxes:
                taxes = product.taxes_id.filtered(
                    lambda t: t.company_id.id == self.env.user.id)
            currency = self.pos_config.pricelist_id.currency_id
            res = taxes.compute_all(price, currency, qty, product=product)
            untax = res['total_excluded']
            return untax, sum(tax.get('amount', 0.0) for tax in res['taxes'])
        self.ir_config_parameter.set_param(
            'point_of_sale.receipt_options',
            '2'
        )
        open_session = self.PosSession.search([
            ('state', '!=', 'closed'),
            ('config_id', '=', self.pos_config.id),
            ('rescue', '=', False)
        ])
        if open_session:
            current_session = open_session
        else:
            self.pos_config.open_session_cb()
            current_session = self.pos_config.current_session_id
        untax, atax = compute_tax(self.led_lamp, 0.9)
        carrot_order = {
            'data': {
                'amount_paid': untax + atax,
                'amount_return': 0,
                'amount_tax': atax,
                'amount_total': untax + atax,
                'creation_date': fields.Datetime.to_string(
                    fields.Datetime.now()
                ),
                'fiscal_position_id': False,
                'pricelist_id': self.pos_config.available_pricelist_ids[0].id,
                'lines': [[0, 0, {
                    'discount': 0,
                    'id': 43,
                    'pack_lot_ids': [],
                    'price_unit': 0.9,
                    'product_id': self.led_lamp.id,
                    'price_subtotal': 0.9,
                    'price_subtotal_incl': 1.04,
                    'qty': 1,
                    'tax_ids': [(6, 0, self.led_lamp.taxes_id.ids)]}]],
                'name': 'Order 00042-003-0024',
                'partner_id': False,
                'pos_session_id': current_session.id,
                'sequence_number': 3,
                'statement_ids': [[0, 0, {
                    'account_id': self.env.user.partner_id.
                        property_account_receivable_id.id,
                    'amount': untax + atax,
                    'journal_id': self.pos_sale_journal[0].id,
                    'name': fields.Datetime.now(),
                    'statement_id': current_session.statement_ids[0].id}]],
                'uid': '00042-003-0028',
                'user_id': self.env.uid
            },
            'id': '00042-003-0028',
            'to_invoice': False
        }
        untax, atax = compute_tax(self.whiteboard_pen, 1.2)
        self.PosOrder02 = self.PosOrder.browse(
            self.PosOrder.create_from_ui([carrot_order]))
        self.PosOrder.action_pos_order_paid()
        self.PosOrder02._send_order_cron()
        current_session.action_pos_session_closing_control()

    def test_03_pos_config_mail_sent_print_partner(self):
        """
            POS config Email receipt and print it
            Set Partner
        """
        def compute_tax(product, price, qty=1, taxes=None):
            if not taxes:
                taxes = product.taxes_id.filtered(
                    lambda t: t.company_id.id == self.env.user.id)
            currency = self.pos_config.pricelist_id.currency_id
            res = taxes.compute_all(price, currency, qty, product=product)
            untax = res['total_excluded']
            return untax, sum(tax.get('amount', 0.0) for tax in res['taxes'])
        self.ir_config_parameter.set_param('point_of_sale.receipt_options',
                                           '2')
        open_session = self.PosSession.search([
            ('state', '!=', 'closed'),
            ('config_id', '=', self.pos_config.id),
            ('rescue', '=', False)
        ])
        if open_session:
            current_session = open_session
        else:
            self.pos_config.open_session_cb()
            current_session = self.pos_config.current_session_id
        untax, atax = compute_tax(self.led_lamp, 0.9)
        carrot_order = {
            'data': {
                'amount_paid': untax + atax,
                'amount_return': 0,
                'amount_tax': atax,
                'amount_total': untax + atax,
                'creation_date': fields.Datetime.to_string(
                    fields.Datetime.now()
                ),
                'fiscal_position_id': False,
                'pricelist_id': self.pos_config.available_pricelist_ids[0].id,
                'lines': [[0, 0, {
                    'discount': 0,
                    'id': 44,
                    'pack_lot_ids': [],
                    'price_unit': 0.9,
                    'product_id': self.led_lamp.id,
                    'price_subtotal': 0.9,
                    'price_subtotal_incl': 1.04,
                    'qty': 1,
                    'tax_ids': [(6, 0, self.led_lamp.taxes_id.ids)]}]],
                'name': 'Order 00042-003-0044',
                'partner_id': self.partner1.id,
                'pos_session_id': current_session.id,
                'sequence_number': 4,
                'statement_ids': [[0, 0, {
                    'account_id': self.env.user.partner_id.
                        property_account_receivable_id.id,
                    'amount': untax + atax,
                    'journal_id': self.pos_sale_journal[0].id,
                    'name': fields.Datetime.now(),
                    'statement_id': current_session.statement_ids[0].id}]],
                'uid': '00042-003-0129',
                'user_id': self.env.uid
            },
            'id': '00042-003-0129',
            'to_invoice': False
        }
        untax, atax = compute_tax(self.whiteboard_pen, 1.2)
        self.PosOrder03 = self.PosOrder.browse(
            self.PosOrder.create_from_ui([carrot_order]))
        self.PosOrder.action_pos_order_paid()
        self.PosOrder._send_order_cron()
        current_session.action_pos_session_closing_control()

    def test_04_pos_config_mail_print_partner_e_ticket(self):
        """
            POS config Email receipt and print it
            Set Partner and also e-receipt
        """
        def compute_tax(product, price, qty=1, taxes=None):
            if not taxes:
                taxes = product.taxes_id.filtered(
                    lambda t: t.company_id.id == self.env.user.id)
            currency = self.pos_config.pricelist_id.currency_id
            res = taxes.compute_all(price, currency, qty, product=product)
            untax = res['total_excluded']
            return untax, sum(tax.get('amount', 0.0) for tax in res['taxes'])
        self.ir_config_parameter.set_param('point_of_sale.receipt_options',
                                           '2')
        self.partner_3.email_pos_receipt = True
        open_session = self.PosSession.search([
            ('state', '!=', 'closed'),
            ('config_id', '=', self.pos_config.id),
            ('rescue', '=', False)
        ])
        if open_session:
            current_session = open_session
        else:
            self.pos_config.open_session_cb()
            current_session = self.pos_config.current_session_id
        untax, atax = compute_tax(self.led_lamp, 0.9)
        carrot_order = {
            'data': {
                'amount_paid': untax + atax,
                'amount_return': 0,
                'amount_tax': atax,
                'amount_total': untax + atax,
                'creation_date': fields.Datetime.to_string(
                    fields.Datetime.now()
                ),
                'fiscal_position_id': False,
                'pricelist_id': self.pos_config.available_pricelist_ids[0].id,
                'lines': [[0, 0, {
                    'discount': 0,
                    'id': 45,
                    'pack_lot_ids': [],
                    'price_unit': 0.9,
                    'product_id': self.led_lamp.id,
                    'price_subtotal': 0.9,
                    'price_subtotal_incl': 1.04,
                    'qty': 1,
                    'tax_ids': [(6, 0, self.led_lamp.taxes_id.ids)]}]],
                'name': 'Order 00042-003-0051',
                'partner_id': self.partner_3.id,
                'pos_session_id': current_session.id,
                'sequence_number': 4,
                'statement_ids': [[0, 0, {
                    'account_id': self.env.user.partner_id.
                        property_account_receivable_id.id,
                    'amount': untax + atax,
                    'journal_id': self.pos_sale_journal[0].id,
                    'name': fields.Datetime.now(),
                    'statement_id': current_session.statement_ids[0].id}]],
                'uid': '00042-003-0151',
                'user_id': self.env.uid
            },
            'id': '00042-003-0151',
            'to_invoice': False
        }
        untax, atax = compute_tax(self.whiteboard_pen, 1.2)
        self.PosOrder04 = self.PosOrder.browse(
            self.PosOrder.create_from_ui([carrot_order]))
        self.PosOrder04.action_pos_order_paid()
        self.PosOrder._send_order_cron()
        current_session.action_pos_session_closing_control()
