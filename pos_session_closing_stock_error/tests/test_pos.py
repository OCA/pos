from odoo import fields
from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestPos(TransactionCase):

    def setUp(self):
        super().setUp()
        self.pos_config = self.env.ref('point_of_sale.pos_config_main').copy({
            'name': 'Block PoS Session with Stock Error',
            'allow_session_closing_with_stock_errors': False,
        })
        self.product_tracking = self.env.ref(
            'point_of_sale.desk_organizer'
        ).copy({
            'name': 'Product with Tracking',
            'tracking': 'serial',
        })

    def test_session_closing_with_errors(self):
        pos_session = self.env['pos.session'].create({
            'config_id': self.pos_config.id,
        })
        # We create an order that will generate errors
        # (the product requires a serial number)
        pos_order = self.env['pos.order'].create({
            'session_id': pos_session.id,
            'lines': [(0, 0, {
                'name': 'OL/0001',
                'product_id': self.product_tracking.id,
                'tax_ids': False,
                'qty': 1.0,
                'price_unit': 1000,
                'price_subtotal': 1000,
                'price_subtotal_incl': 1000,
            })],
            'amount_total': 1000.0,
            'amount_tax': 0.0,
            'amount_paid': 1000.0,
            'amount_return': 0.0,
        })
        # Register order payment
        pos_order.add_payment({
            'amount': 1000,
            'payment_date': fields.Datetime.now(),
            'statement_id': pos_session.statement_ids[0].id,
            'payment_name': 'PAY',
            'journal': pos_session.statement_ids[0].journal_id.id,
            })
        # Set ending balance in statement
        pos_session.statement_ids[0].write({
            'balance_end_real': pos_session.statement_ids[0].balance_end
        })
        pos_order.action_pos_order_paid()
        # Blocked because we have errors
        with self.assertRaises(ValidationError):
            pos_session.action_pos_session_close()
        # Enable closing with errors
        self.pos_config.write({
            'allow_session_closing_with_stock_errors': True,
        })
        # Should be possible to close now
        pos_session.action_pos_session_close()
