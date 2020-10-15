from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


class TestPointOfSaleFlow(TestPointOfSaleCommon):

    def setUp(self):
        super(TestPointOfSaleFlow, self).setUp()
        self.tax_22_incl = self.env['account.tax'].create({
            'name': 'VAT 22 perc Incl',
            'amount_type': 'percent',
            'amount': 22.0,
            'price_include': 1
        })

    def test_close_session(self):
        self.pos_config.open_session_cb()
        self.pos_order_pos1 = self.PosOrder.create({
            'company_id': self.company_id,
            'lines': [(0, 0, {
                'name': "OL/0001",
                'product_id': self.product3.id,
                'price_unit': 17,
                'discount': 0.0,
                'qty': 1.0,
                'tax_ids': [(6, 0, self.tax_22_incl.ids)],
                'price_subtotal': 13.93,
                'price_subtotal_incl': 17,
            }), (0, 0, {
                'name': "OL/0002",
                'product_id': self.product4.id,
                'price_unit': -2,
                'discount': 0.0,
                'qty': 1.0,
                'tax_ids': [(6, 0, self.tax_22_incl.ids)],
                'price_subtotal': -1.64,
                'price_subtotal_incl': -2,
            })],
            'amount_tax': 2.71,
            'amount_total': 15,
            'amount_paid': 0,
            'amount_return': 0,
        })
        context_make_payment = {
            "active_ids": [self.pos_order_pos1.id],
            "active_id": self.pos_order_pos1.id
        }
        self.pos_make_payment_1 = self.PosMakePayment.with_context(
            context_make_payment).create({
                'amount': 15,
            })
        context_payment = {'active_id': self.pos_order_pos1.id}
        self.pos_make_payment_1.with_context(context_payment).check()

        self.pos_order_pos2 = self.PosOrder.create({
            'company_id': self.company_id,
            'lines': [(0, 0, {
                'name': "OL/0001",
                'product_id': self.product3.id,
                'price_unit': 17,
                'discount': 0.0,
                'qty': 1.0,
                'tax_ids': [(6, 0, self.tax_22_incl.ids)],
                'price_subtotal': 13.93,
                'price_subtotal_incl': 17,
            }), (0, 0, {
                'name': "OL/0002",
                'product_id': self.product4.id,
                'price_unit': -2,
                'discount': 0.0,
                'qty': 1.0,
                'tax_ids': [(6, 0, self.tax_22_incl.ids)],
                'price_subtotal': -1.64,
                'price_subtotal_incl': -2,
            })],
            'amount_tax': 2.71,
            'amount_total': 15,
            'amount_paid': 0,
            'amount_return': 0,
        })
        context_make_payment = {
            "active_ids": [self.pos_order_pos2.id],
            "active_id": self.pos_order_pos2.id
        }
        self.pos_make_payment_2 = self.PosMakePayment.with_context(
            context_make_payment).create({
                'amount': 15,
            })
        context_payment = {'active_id': self.pos_order_pos2.id}
        self.pos_make_payment_2.with_context(context_payment).check()

        session = self.pos_config.current_session_id
        session.action_pos_session_closing_control()
        self.assertEqual(len(session.order_ids[0].account_move.line_ids), 3)

        self.assertEqual(
            session.order_ids[0].account_move.line_ids[0].name,
            'VAT 22 perc Incl: tax')
        self.assertEqual(
            session.order_ids[0].account_move.line_ids[0].credit, 5.41)
        self.assertEqual(
            session.order_ids[0].account_move.line_ids[0].tax_line_id.id,
            self.tax_22_incl.id)

        self.assertEqual(
            session.order_ids[0].account_move.line_ids[2].name,
            'Trade Receivables')
        self.assertEqual(
            session.order_ids[0].account_move.line_ids[2].debit, 30)
