# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Store Draft Orders Module for Odoo
#    Copyright (C) 2015-Today GRAP (http://www.grap.coop)
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp.exceptions import Warning
from openerp.tests.common import TransactionCase


class TestPosStoreDraftOrder(TransactionCase):

    def setUp(self):
        super(TestPosStoreDraftOrder, self).setUp()

        self.session_obj = self.env['pos.session']
        self.order_obj = self.env['pos.order']

        self.pos_config_id = self.ref('point_of_sale.pos_config_main')
        self.product_id = self.ref('product.product_product_48')
        self.cash_journal_id = self.ref('account.cash_journal')

    # Test Section
    def test_01_allow_draft_order_unpaid(self):
        """Test the possibility to let a PoS Order in a draft state if it is
         not paid at all."""
        # Open a new session
        session_1 = self.session_obj.create({'config_id': self.pos_config_id})

        # Create Order
        order = self.order_obj.create({
            'session_id': session_1.id,
            'lines': [[0, False, {
                'discount': 0,
                'price_unit': 10,
                'product_id': self.product_id,
                'qty': 1}]]
        })

        # Close Session
        session_1.signal_workflow('close')

        self.assertEquals(
            session_1.state, 'closed',
            "Unpaid Draft Orders must not block the closing process of the"
            " associated session.")

        # Open a second session
        session_2 = self.session_obj.create({'config_id': self.pos_config_id})

        self.assertEquals(
            order.session_id.id, session_2.id,
            "Draft Orders of a previous session must be associated to the"
            " new opened session to allow payment.")

    # Test Section
    def test_02_block_draft_order_partial_paid(self):
        """Test the unpossibility to let a PoS Order in a draft state if it is
        in a partial paid state."""
        # Open a new session
        session_1 = self.session_obj.create({'config_id': self.pos_config_id})

        # Create Order
        order = self.order_obj.create({
            'session_id': session_1.id,
            'lines': [[0, False, {
                'discount': 0,
                'price_unit': 10,
                'product_id': self.product_id,
                'qty': 3}]]
        })

        # Make partial payment
        self.order_obj.add_payment(
            order.id, {'amount': 1, 'journal': self.cash_journal_id})

        # Try Close Session (Must fail)
        with self.assertRaises(Warning):
            session_1.signal_workflow('close')
