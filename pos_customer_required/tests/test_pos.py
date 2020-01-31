
import odoo.tests.common as common
from odoo import exceptions


class TestPosRequireCustomer(common.TransactionCase):
    def setUp(self):
        super(TestPosRequireCustomer, self).setUp()
        self.pos_config = self.env.ref('point_of_sale.pos_config_main').copy()

    def test_customer_not_required(self):
        self.pos_config.require_customer = 'no'

        # Now Create new session and create a
        # pos order in this session
        pos_session = self.env['pos.session'].create({
            'user_id': 1,
            'config_id': self.pos_config.id
        })
        # should not raise any exception
        self.env['pos.order'].create({
            'session_id': pos_session.id,
            'partner_id': False,
            'amount_tax': 0.0,
            'amount_total': 0.0,
            'amount_paid': 0.0,
            'amount_return': 0.0
        })

    def test_customer_is_required(self):
        self.pos_config.require_customer = 'order'

        # Now Create new session and create a
        # pos order in this session
        pos_session = self.env['pos.session'].create({
            'user_id': 1,
            'config_id': self.pos_config.id
        })
        # should raise exceptions.ValidationError
        with self.assertRaises(exceptions.ValidationError):
            self.env['pos.order'].create({
                'session_id': pos_session.id,
                'partner_id': False,
                'amount_tax': 0.0,
                'amount_total': 0.0,
                'amount_paid': 0.0,
                'amount_return': 0.0
            })
