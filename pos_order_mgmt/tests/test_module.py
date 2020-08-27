# Copyright (C) 2019 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields
from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):

    def setUp(self):
        super(TestModule, self).setUp()

        # Get Registry
        self.PosOrder = self.env['pos.order']
        self.AccountPayment = self.env['account.payment']

        # Get Object
        self.pos_product = self.env["product.product"].create({
            "name": "Test POS Product",
        })
        self.pricelist = self.env["product.pricelist"].create({
            "name": "Test pricelist",
            "currency_id": self.env.user.company_id.currency_id.id,
            "item_ids": [(0, 0, {
                "applied_on": "3_global",
                "compute_price": "formula",
                "base": "list_price",
            })]
        })
        self.partner = self.env["res.partner"].create({
            "name": "Mr. Odoo",
            "property_product_pricelist": self.pricelist.id,
        })

        # Create a new pos config and open it
        self.pos_config = self.env.ref('point_of_sale.pos_config_main').copy({
            'available_pricelist_ids': [(6, 0, self.pricelist.ids)],
            'pricelist_id': self.pricelist.id,
        })
        self.pos_config.open_session_cb()

    # Test Section
    def test_load_order(self):
        order = self._create_order()
        orders_data = self.PosOrder.search_done_orders_for_pos(
            [], self.pos_config.current_session_id.id)
        self.assertEqual(len(orders_data), 1)
        self.assertEqual(
            orders_data[0]['id'], order.id)

        detail_data = order.load_done_order_for_pos()
        self.assertEqual(
            len(detail_data.get('line_ids', [])), 1,
            "Loading order detail failed")

    def _create_order(self):
        # Create order
        order_data = {
            'id': u'0006-001-0010',
            'to_invoice': True,
            'data': {
                'pricelist_id': self.pricelist.id,
                'user_id': 1,
                'name': 'Order 0006-001-0010',
                'partner_id': self.partner.id,
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
