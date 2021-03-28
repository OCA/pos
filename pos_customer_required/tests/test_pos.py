# -*- coding: utf-8 -*-

import openerp.tests.common as common
from openerp import exceptions


class TestPosRequireCustomer(common.TransactionCase):
    def setUp(self):
        super(TestPosRequireCustomer, self).setUp()

    def test_customer_not_required(self):
        posconfig = self.env.ref('point_of_sale.pos_config_main')
        posconfig.require_customer = 'no'

        # Now Create new session and create a
        # pos order in this session
        pos_session = self.env['pos.session'].create(
            {'config_id': posconfig.id})
        # should not raise any exception
        self.env['pos.order'].create({
            'session_id': pos_session.id,
            'partner_id': False,
        })

    def test_customer_is_required(self):
        posconfig = self.env.ref('point_of_sale.pos_config_main')
        posconfig.require_customer = 'order'

        # Now Create new session and create a
        # pos order in this session
        pos_session = self.env['pos.session'].create(
            {'config_id': posconfig.id})
        # should raise exceptions.ValidationError
        with self.assertRaises(exceptions.ValidationError):
            self.env['pos.order'].create({
                'session_id': pos_session.id,
                'partner_id': False,
            })
