# Copyright 2018 Tecnativa - David Vidal
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import common


@common.at_install(False)
@common.post_install(True)
class TestPOSOrderReturn(common.HttpCase):
    def setUp(self):
        super(TestPOSOrderReturn, self).setUp()
        self.pricelist = self.env['product.pricelist'].create({
            'name': 'Test pricelist',
            'item_ids': [(0, 0, {
                'applied_on': '3_global',
                'compute_price': 'formula',
                'base': 'list_price',
            })]
        })
        self.partner = self.env['res.partner'].create({
            'name': 'Mr. Odoo',
            'property_product_pricelist': self.pricelist.id,
        })
        self.product_1 = self.env['product.product'].create({
            'name': 'Test product 1',
            'standard_price': 1.0,
            'type': 'product',
            'pos_allow_negative_qty': False,
            'taxes_id': False,
        })
        self.product_2 = self.env['product.product'].create({
            'name': 'Test product 2',
            'standard_price': 1.0,
            'type': 'product',
            'pos_allow_negative_qty': True,
            'taxes_id': False,
        })
        self.PosOrder = self.env['pos.order']
        self.pos_config = self.env.ref('point_of_sale.pos_config_main')
        self.pos_config.write({
            'available_pricelist_ids': [(6, 0, self.pricelist.ids)],
            'pricelist_id': self.pricelist.id,
        })
        self.pos_config.open_session_cb()
        self.pos_order = self.PosOrder.create({
            'session_id': self.pos_config.current_session_id.id,
            'partner_id': self.partner.id,
            'pricelist_id': self.partner.property_product_pricelist.id,
            'amount_tax': 0,
            'amount_total': 2700,
            'amount_paid': 2700,
            'amount_return': 0,
            'lines': [
                (0, 0, {
                    'name': 'POSLINE/0001',
                    'product_id': self.product_1.id,
                    'price_unit': 450,
                    'price_subtotal': 450,
                    'price_subtotal_incl': 450,
                    'qty': 2.0,
                }),
                (0, 0, {
                    'name': 'POSLINE/0002',
                    'product_id': self.product_2.id,
                    'price_unit': 450,
                    'price_subtotal': 450,
                    'price_subtotal_incl': 450,
                    'qty': 2.0,
                }),
                (0, 0, {
                    'name': 'POSLINE/0003',
                    'product_id': self.product_1.id,
                    'price_unit': 450,
                    'price_subtotal': 450,
                    'price_subtotal_incl': 450,
                    'qty': 2.0,
                }),
            ],
        })
        pos_make_payment = self.env['pos.make.payment'].with_context({
            'active_ids': [self.pos_order.id],
            'active_id': self.pos_order.id,
        }).create({})
        pos_make_payment.with_context(active_id=self.pos_order.id).check()
        self.pos_order.create_picking()
        res = self.pos_order.action_pos_order_invoice()
        self.invoice = self.env['account.invoice'].browse(res['res_id'])

    def test_pos_order_full_refund(self):
        self.pos_order.refund()
        refund_order = self.pos_order.refund_order_ids
        self.assertEqual(len(refund_order), 1)
        pos_make_payment = self.env['pos.make.payment'].with_context({
            'active_ids': refund_order.ids,
            'active_id': refund_order.id,
        }).create({})
        pos_make_payment.with_context(active_id=refund_order.id).check()
        refund_invoice = refund_order.invoice_id
        self.assertEqual(refund_invoice.refund_invoice_id, self.invoice)
        # Partner balance is 0
        self.assertEqual(sum(
            self.partner.mapped('invoice_ids.amount_total_signed')), 0)
        self.assertEqual(self.pos_order.picking_id.state, 'done')

    def test_pos_order_partial_refund(self):
        partial_refund = self.env['pos.partial.return.wizard'].with_context({
            'active_ids': self.pos_order.ids,
            'active_id': self.pos_order.id,
        }).create({})
        # Return just 1 item from line POSLINE/0001
        partial_refund.line_ids[0].qty = 1
        # Return 2 items from line POSLINE/0003
        partial_refund.line_ids[1].qty = 2
        partial_refund.confirm()
        refund_order = self.pos_order.refund_order_ids
        self.assertEqual(len(refund_order), 1)
        self.assertEqual(len(refund_order.lines), 2)
        pos_make_payment = self.env['pos.make.payment'].with_context({
            'active_ids': refund_order.ids,
            'active_id': refund_order.id,
        }).create({})
        pos_make_payment.with_context(active_id=refund_order.id).check()
        # Partner balance is 1350
        self.assertEqual(sum(
            self.partner.mapped('invoice_ids.amount_total_signed')), 1350)
        self.assertEqual(self.pos_order.picking_id.state, 'done')
