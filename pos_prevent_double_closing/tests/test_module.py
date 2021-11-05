# Copyright (C) 2021-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields
from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase


class TestModule(TransactionCase):

    def setUp(self):
        super().setUp()
        self.pos_config = self.env.ref('point_of_sale.pos_config_main').copy({
            'name': 'Pos Prevent Account Duplicates Session',
        })
        self.product = self.env.ref(
            'point_of_sale.desk_organizer'
        )

    def test_duplicates(self):
        pos_session = self.env['pos.session'].create({
            'config_id': self.pos_config.id,
        })
        pos_order = self.env['pos.order'].create({
            'session_id': pos_session.id,
            'lines': [(0, 0, {
                'name': 'OL/0001',
                'product_id': self.product.id,
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

        # close session, should success
        pos_session.action_pos_session_close()

        # Retry to close session should faild
        with self.assertRaises(ValidationError):
            pos_session.action_pos_session_close()
