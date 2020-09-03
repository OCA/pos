# -*- coding: utf-8 -*-
# Copyright 2017 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields

from odoo.tests.common import SavepointCase


class TestSequenceNumberSync(SavepointCase):

    @classmethod
    def setUpClass(cls):
        """
        Simulation of sales coming from the interface
        """
        super(TestSequenceNumberSync, cls).setUpClass()

        # ENVIRONEMENTS
        cls.pos_obj = cls.env['pos.order']
        cls.partner_obj = cls.env['res.partner']

        # INSTANCES
        cls.partner = cls.partner_obj.create({'name': 'test_partner_A'})
        cls.product = cls.env.ref(
            'product.product_order_01')
        cls.pos_config = cls.env.ref('point_of_sale.pos_config_main')

        # USING VARIABLE
        cls.sequence_ref_number = 10
        cls.sequence_number = 2

        # USER PARTNER
        cls.user_partner = cls.env.user.partner_id

    def get_data(self, session, sequence_number):
        return '000' + str(session.id) + '-001-000' + str(sequence_number)

    def ui_order_data(self, sequence_ref_number, sequence_number,
                      current_session):
        values = {
            'data': {
                'creation_date': fields.Datetime.now(),
                'fiscal_position_id': False,
                'pricelist_id': current_session.config_id.pricelist_id.id,
                'amount_return': 0,
                'sequence_ref_number': sequence_ref_number,
                'lines': [[0, 0, {'product_id': self.product.id,
                                  'qty': 1}]],
                'name': 'Order ' + self.get_data(
                    current_session, sequence_number),
                'partner_id': False,
                'pos_session_id': current_session.id,
                'sequence_number': sequence_number,
                'statement_ids': [[0, 0, {
                    'account_id':
                        self.user_partner.property_account_receivable_id.id,
                    'amount': 0.9,
                    'journal_id': self.pos_config.journal_ids[0].id,
                    'name': fields.Datetime.now(),
                    'statement_id':current_session.statement_ids[0].id}]],
                'user_id': self.env.uid
            },
            'to_invoice': False
        }

        # because travis install (pos_loyalty)
        # may be an edge effect
        if 'loyalty_points' in self.pos_obj._fields:
            values['data']['loyalty_points'] = 0

        return values

    def test_check_sequence_number_sync_00(self):
        """
            case 1 :
            1 - create order from ui
            2 - close session
            3 - create new order from ui,
            4 - close session
            5 - validate closing & post entries
            sequence result : 000session_id-001-000sequence_number
            and 000new_session_id+1-001-000sequence_number
            order name result : Main/00sequence_ref_number
        """

        # click on create a new session button
        self.pos_config.open_session_cb()

        # session
        current_session = self.pos_config.current_session_id

        # data
        ui_order = self.ui_order_data(self.sequence_ref_number,
                                      self.sequence_number, current_session)

        # I create an order on an open session
        pos_order_id = self.pos_obj.create_from_ui([ui_order])
        pos_order = self.env['pos.order'].browse(pos_order_id)
        self.assertEqual(pos_order.name,
                         'Main/00' + str(self.sequence_ref_number))
        self.assertEqual(pos_order.pos_reference,
                         'Order 000' + str(current_session.id)+'-001-0002')

        # close the session
        self.pos_config.current_session_id.action_pos_session_closing_control()

        # create an open new session
        self.pos_config.open_session_cb()
        new_current_session = self.pos_config.current_session_id
        ui_order['data']['pos_session_id'] = new_current_session.id
        ui_order['data']['name'] = self.get_data(
            new_current_session, self.sequence_number)

        # create an order on an open session
        pos_order_id = self.pos_obj.create_from_ui([ui_order])
        pos_order = self.env['pos.order'].browse(pos_order_id)
        self.assertEqual(pos_order.name,
                         'Main/00' + str(self.sequence_ref_number))
        self.assertEqual(pos_order.pos_reference,
                         '000' + str(new_current_session.id)+'-001-0002')

    def test_check_sequence_number_sync_01(self):
        """
            case 2 :
            1 - create order from ui,
            2 - create new order from ui
            3 - validate closing & post entries
            sequence result : 000session_id-001-000sequence_number
            and 000session_id-001-000new_sequence_number
            order name result : Main/00sequence_ref_number
        """

        # create a new session button
        self.pos_config.open_session_cb()

        # session
        current_session = self.pos_config.current_session_id

        # data
        ui_order = self.ui_order_data(self.sequence_ref_number,
                                      self.sequence_number, current_session)

        # create an order on an open session
        pos_order_id = self.pos_obj.create_from_ui([ui_order])
        pos_order = self.env['pos.order'].browse(pos_order_id)
        self.assertEqual(pos_order.name,
                         'Main/00' + str(self.sequence_ref_number))
        self.assertEqual(pos_order.pos_reference,
                         'Order 000' + str(current_session.id) + '-001-0002')

        self.sequence_number = self.sequence_number+1
        ui_order = self.ui_order_data(self.sequence_ref_number,
                                      self.sequence_number, current_session)
        pos_order_id = self.pos_obj.create_from_ui([ui_order])
        pos_order = self.env['pos.order'].browse(pos_order_id)
        self.assertEqual(pos_order.name,
                         'Main/00' + str(self.sequence_ref_number))
        self.assertEqual(pos_order.pos_reference,
                         'Order 000' + str(current_session.id) + '-001-0003')
        # close the session
        self.pos_config.current_session_id.action_pos_session_closing_control()
