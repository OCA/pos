# Copyright 2018 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):

    def setUp(self):
        super(TestModule, self).setUp()
        self.PosOrder = self.env['pos.order']
        self.QueueJob = self.env['queue.job']
        self.currency = self.env.user.company_id.currency_id
        self.pos_product = self.env.ref('point_of_sale.whiteboard_pen')
        self.pricelist = self.env['product.pricelist'].create({
            'name': 'Test pricelist',
            'item_ids': [(0, 0, {
                'applied_on': '3_global',
                'compute_price': 'formula',
                'base': 'list_price',
            })],
            'currency_id': self.currency.id,
        })

        # Create a new pos config and open it
        self.pos_config = self.env.ref('point_of_sale.pos_config_main').copy({
            'available_pricelist_ids': [(6, 0, self.pricelist.ids)],
            'pricelist_id': self.pricelist.id,
            'currency_id': self.currency.id,
        })
        self.pos_config.open_session_cb()

    def test_01_picking_delayed_enabled(self):
        # Enable feature
        self.pos_config.picking_creation_delayed = True

        order = self._create_order()

        self.assertEqual(
            order.picking_id.id, False,
            "Creating order via UI should not generate a picking if"
            " feature is enabled")

        # Test if a Queue Job has been generated
        func_string = 'pos.order(%d,)._create_delayed_picking()' % (order.id)
        queues = self.QueueJob.search([
            ('func_string', '=', func_string)])
        self.assertEqual(len(queues), 1, "Queue Job has not been created")

    def test_02_picking_delayed_disabled(self):
        # Disable feature
        self.pos_config.picking_creation_delayed = False

        order = self._create_order()

        picking_id = order.picking_id.id
        self.assertNotEqual(
            picking_id, False,
            "Creating order via UI should generate a picking if"
            " feature is disabled")

        # Test if a Queue Job has not been generated
        func_string = 'pos.order(%d,)._create_delayed_picking()' % (order.id)
        queues = self.QueueJob.search([
            ('func_string', '=', func_string)])
        self.assertEqual(len(queues), 0, "Queue Job has been created")

    def _create_order(self):
        # Create order
        order_data = {
            'id': u'0006-001-0010',
            'to_invoice': False,
            'data': {
                'pricelist_id': self.pricelist.id,
                'user_id': 1,
                'name': 'Order 0006-001-0010',
                'partner_id': False,
                'amount_paid': 0.9,
                'pos_session_id': self.pos_config.current_session_id.id,
                'lines': [[0, 0, {
                    'product_id': self.pos_product.id,
                    'price_unit': 0.9,
                    'qty': 1,
                    'price_subtotal': 0.9,
                    'price_subtotal_incl': 0.9,
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

        result = self.PosOrder.create_from_ui([order_data])
        order = self.PosOrder.browse(result[0])
        return order
