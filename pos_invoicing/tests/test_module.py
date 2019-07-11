# coding: utf-8
# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import time
from openerp.tests.common import TransactionCase


class TestPosInvoicing(TransactionCase):
    """Tests for POS Invoicing Module"""

    def setUp(self):
        super(TestPosInvoicing, self).setUp()

        # Get Registry
        self.session_obj = self.env['pos.session']
        self.order_obj = self.env['pos.order']

        # Get Object
        self.config = self.env.ref('point_of_sale.pos_config_main')
        self.partner_A = self.env.ref('base.res_partner_2')
        self.partner_B = self.env.ref('base.res_partner_12')
        self.product = self.env.ref('product.product_product_48')
        self.payment_journal = self.env.ref('account.cash_journal')

    # Test Section
    def test_01_invoice_with_payment(self):
        """Test the workflow: Draft Order -> Payment -> Invoice"""
        # Opening Session
        session = self.session_obj.create({'config_id': self.config.id})

        # TODO FIXME, for the time being, reconciliation is not
        # set if a customer make many invoices in the same pos session.
        # self._create_order(session, self.partner_A, 100, True)
        # self._create_order(session, self.partner_A, 200, True)
        self._create_order(session, self.partner_B, 400, True)

        # The Invoice must be unpayable but in 'open' state
        # Invoice created by order should be in open state
        invoiced_orders = session.mapped('order_ids').filtered(
            lambda x: x.state == 'invoiced')
        invoices = invoiced_orders.mapped('invoice_id')

        self.assertEquals(
            [x for x in invoices.mapped('state') if x != 'open'], [],
            "All invoices generated from PoS should be in the 'open' state"
            " when session is opened")

        self.assertEquals(
            [x for x in invoices.mapped('pos_pending_payment') if not x],
            [],
            "All invoices generated from PoS should be marked as PoS Pending"
            " Payment when session is opened")

        # Close Session
        session.signal_workflow('close')

        self.assertEquals(
            [x for x in invoices.mapped('state') if x != 'paid'], [],
            "All invoices generated from PoS should be in the 'paid' state"
            " when session is closed")

        self.assertEquals(
            [x for x in invoices.mapped('pos_pending_payment') if x], [],
            "Invoices generated from PoS should not be marked as PoS Pending"
            " Payment when session is closed")

    # Private Section
    def _create_order(self, session, partner, amount, with_invoice):
        # create Pos Order
        order = self.order_obj.create({
            'session_id': session.id,
            'partner_id': partner.id,
            'lines': [[0, False, {
                'product_id': self.product.id,
                'qty': 1,
                'price_unit': amount,
            }]],
        })
        # Finish Payment
        self.order_obj.add_payment(order.id, {
            'journal': self.payment_journal.id,
            'payment_date': time.strftime('%Y-%m-%d'),
            'amount': amount,
        })
        # Mark as Paid
        order.signal_workflow('paid')
        if with_invoice:
            order.action_invoice()
        return order
