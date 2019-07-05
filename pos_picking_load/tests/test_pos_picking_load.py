# Copyright (C) 2017: Opener B.V. (https://opener.amsterdam)
# @author: Stefan Rijnhart <stefan@opener.am>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields
from odoo.tests.common import TransactionCase


class TestPosPickingLoad(TransactionCase):

    def test_pos_picking_load(self):
        product = self.env.ref('product.product_product_24')
        pricelist = self.env.ref('product.list0')
        # Create a Sale order and confirm it to generate a picking to load
        sale_order = self.env['sale.order'].create({
            'partner_id': self.env.ref('base.res_partner_1').id,
            'order_line': [(0, 0, {
                'product_id': product.id,
                'price_unit': 6,
                'product_uom_qty': 2,
                'qty_delivered_method': 'stock_move',
            })],
        })
        sale_order.action_confirm()
        sale_order.picking_ids.picking_type_id.write({
            'available_in_pos': True})

        # Configure Point of sale
        config = self.env.ref('point_of_sale.pos_config_main').copy()
        config.write({
            'picking_type_id': sale_order.picking_ids.picking_type_id.id})

        # Open a new session
        config.open_session_cb()
        session = self.env['pos.session'].search([
            ('config_id', '=', config.id)])[0]
        date_now = fields.Datetime.now()

        # Create a pos order
        self.env['pos.order'].create_from_ui([{
            'to_invoice': False,
            'data': {
                'pricelist_id': pricelist.id,
                'user_id': self.env.user.id,
                'creation_date': date_now,
                'fiscal_position_id': False,
                'name': 'Order 00017-002-0003',
                'partner_id': sale_order.partner_id.id,
                'amount_paid': 12,
                'pos_session_id': session.id,
                'lines': [[0, 0, {
                    'product_id': product.id,
                    'price_unit': 6,
                    'name': product.name,
                    'discount': 0,
                    'qty': 2,
                    'price_subtotal': 12,
                    'price_subtotal_incl': 12,
                    'tax_ids': [[6, False, []]],
                }]],
                'statement_ids': [[0, 0, {
                    'journal_id': False,
                    'amount': 12,
                    'name': date_now,
                    'account_id': config.journal_ids[
                        0].default_debit_account_id.id,
                    'statement_id': session.statement_ids[0].id,
                }]],
                'amount_tax': 0,
                'origin_picking_id': sale_order.picking_ids.id,
                'uid': '00017-002-0003',
                'amount_return': 0,
                'sequence_number': 3,
                'amount_total': 12,
            },
            'id': '00017-002-0003',
        }])
        pos_order = self.env['pos.order'].search(
            [('origin_picking_id', 'in', sale_order.picking_ids.ids)])
        self.assertTrue(pos_order)
        self.assertEqual(pos_order.origin_picking_id.state, 'cancel')
        self.assertEqual(
            pos_order.picking_id.group_id,
            pos_order.origin_picking_id.group_id)
        self.assertEqual(
            sale_order.invoice_status, 'invoiced')
