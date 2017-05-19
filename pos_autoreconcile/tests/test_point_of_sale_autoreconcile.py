# -*- coding: utf-8 -*-

import odoo
from odoo import fields
from odoo.addons.point_of_sale.tests.common import TestPointOfSaleCommon


@odoo.tests.common.at_install(False)
@odoo.tests.common.post_install(True)
class TestPointOfSaleFlow(TestPointOfSaleCommon):

    def test_create_from_ui(self):
        """
        Simulation of sales coming from the interface,
        even after closing the session
        """

        # I click on create a new session button
        self.pos_config.open_session_cb()

        current_session = self.pos_config.current_session_id
        partner_account_receivable_id = \
            self.env.user.partner_id.property_account_receivable_id.id

        # Amount paid > amount to paid
        # create 2 statements lines
        amount_user_paid = 100.0
        amount_total_to_paid = 90.0
        amount_return = amount_total_to_paid - amount_user_paid

        carrot_order = {
            'data':
                {'amount_paid': amount_user_paid,
                 'amount_return': 0,
                 'amount_tax': 0,
                 'amount_total': amount_total_to_paid,
                 'creation_date': fields.Datetime.now(),
                 'fiscal_position_id': False,
                 'partner_id': self.env.user.partner_id.id,
                 'lines': [[0, 0,
                            {
                                'discount': 0,
                                'id': 42,
                                'pack_lot_ids': [],
                                'price_unit': amount_total_to_paid,
                                'product_id': self.carotte.id,
                                'qty': 1,
                                'tax_ids': [(6, 0, self.carotte.taxes_id.ids)]
                            }]],
                 'name': 'Order 00042-003-0014',
                 'pos_session_id': current_session.id,
                 'sequence_number': 2,
                 'statement_ids': [
                     (0, 0,
                      {'account_id': partner_account_receivable_id,
                       'amount': amount_user_paid,
                       'journal_id': self.pos_config.journal_ids[0].id,
                       'name': fields.Datetime.now(),
                       'statement_id': current_session.statement_ids[0].id}),
                     (0, 0,
                      {'account_id': partner_account_receivable_id,
                       'amount': amount_return,
                       'journal_id': self.pos_config.journal_ids[0].id,
                       'name': fields.Datetime.now(),
                       'statement_id': current_session.statement_ids[0].id}
                      )],
                 'uid': '00042-003-0014',
                 'user_id': self.env.uid},
            'id': '00042-003-0014',
            'to_invoice': False}

        # I create an order on an open session
        self.PosOrder.create_from_ui([carrot_order])

        # I close the session
        current_session.action_pos_session_closing_control()
        self.assertEqual(current_session.state, 'closed',
                         "Session was not properly closed")

        lines_reconciled = []
        for statement in current_session.order_ids.statement_ids:
            if statement.account_id.id != \
                    current_session.order_ids._order_account():
                continue
            for journal in statement.journal_entry_ids:
                for line in journal.line_ids:
                    if (line.account_id.id ==
                            current_session.order_ids._order_account()):
                        lines_reconciled.append(line.id)
        line_reconciled = \
            self.env['account.move.line'].browse(lines_reconciled)
        self.assertEqual(len(line_reconciled), 2)
        self.assertEqual(line_reconciled[0].reconciled, True)
        self.assertEqual(line_reconciled[1].reconciled, True)
