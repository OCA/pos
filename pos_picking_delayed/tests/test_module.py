# -*- coding: utf-8 -*-
# Copyright 2018 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):

    def setUp(self):
        super(TestModule, self).setUp()
        self.pos_order_obj = self.env['pos.order']
        self.pos_picking_cron = self.env.ref(
            'pos_picking_delayed.cron_create_delayed_pos_picking')
        self.pos_config = self.env.ref('point_of_sale.pos_config_main')
        self.carotte_product = self.env.ref('point_of_sale.carotte')

    def test_01_picking_delayed_enabled(self):
        # Disable Cron
        self.pos_picking_cron.active = False

        # Enable feature
        self.pos_config.picking_creation_delayed = True

        order = self._open_session_create_order()

        self.assertEqual(
            order.picking_id.id, False,
            "Creating order via UI should not generate a picking if"
            " feature is enabled")

        # run cron and test if picking is now created
        self.pos_picking_cron.method_direct_trigger()

        self.assertNotEqual(
            order.picking_id.id, False,
            "Run PoS picking Cron should generate picking for PoS Orders"
            " without picking")

    def test_02_picking_delayed_disabled(self):
        # Disable Cron
        self.pos_picking_cron.active = False

        # Disable feature
        self.pos_config.picking_creation_delayed = False

        order = self._open_session_create_order()

        picking_id = order.picking_id.id
        self.assertNotEqual(
            picking_id, False,
            "Creating order via UI should generate a picking if"
            " feature is disabled")

        # run cron and test if picking is now created
        self.pos_picking_cron.method_direct_trigger()

        self.assertEqual(
            order.picking_id.id, picking_id,
            "Run PoS picking Cron should not regenerate picking for"
            " PoS Orders that have already a picking created.")

    def _open_session_create_order(self):
        # Create order
        self.pos_config.open_session_cb()
        order_data = {
            'id': u'0006-001-0010',
            'to_invoice': False,
            'data': {
                'user_id': 1,
                'name': 'Order 0006-001-0010',
                'partner_id': False,
                'amount_paid': 0.9,
                'pos_session_id': self.pos_config.current_session_id.id,
                'lines': [[0, 0, {
                    'id': 1,
                    'product_id': self.carotte_product.id,
                    'tax_ids': [[6, False, []]],
                    'price_unit': 0.9,
                    'qty': 1,
                    'pack_lot_ids': [],
                    'discount': 0,
                }]],
                'statement_ids': [[0, 0, {
                    'journal_id': self.pos_config.journal_ids[0].id,
                    'amount': 0.9,
                    'name': fields.Datetime.now(),
                    'account_id':
                    self.env.user.partner_id.property_account_receivable_id.id,
                    'statement_id':
                    self.pos_config.current_session_id.statement_ids[0].id,
                }]],
                'creation_date': u'2018-09-27 15:51:03',
                'amount_tax': 0,
                'fiscal_position_id': False,
                'uid': u'00001-001-0001',
                'amount_return': 0,
                'sequence_number': 1,
                'amount_total': 0.9,
            }}

        # Test if picking is not created
        result = self.pos_order_obj.create_from_ui([order_data])
        order = self.pos_order_obj.browse(result[0])
        return order
