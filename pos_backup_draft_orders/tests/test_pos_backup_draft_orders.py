# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Backup Draft Orders module for OpenERP
#    Copyright (C) 2013-2014 GRAP (http://www.grap.coop)
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

# from openerp.osv import osv
from openerp.tests.common import TransactionCase


class TestPosBackupDraftOrders(TransactionCase):
    """Tests for 'Point Of Sale - Backup Draft Orders' Module"""

    def setUp(self):
        super(TestPosBackupDraftOrders, self).setUp()
        cr, uid = self.cr, self.uid
        self.imd_obj = self.registry('ir.model.data')
        self.po_obj = self.registry('pos.order')
        self.ps_obj = self.registry('pos.session')
        self.abs_obj = self.registry('account.bank.statement')
        pc_id = self.imd_obj.get_object_reference(
            cr, uid, 'point_of_sale', 'pos_config_main')[1]
        self.session_id = self.ps_obj.create(cr, uid, {
            'config_id': pc_id,
        })
        self.evian_product_id = self.imd_obj.get_object_reference(
            cr, uid, 'point_of_sale', 'evian_2l')[1]
        self.cash_journal_id = self.imd_obj.get_object_reference(
            cr, uid, 'account', 'cash_journal')[1]
        self.statement_id = self.abs_obj.search(cr, uid, [
            ('journal_id', '=', self.cash_journal_id),
            ('state', '=', 'open')])[0]

    # Test Section
    def test_01_create_paid_order(self):
        """[Non regression] Test if the behaviour when the POS order is
        paid works."""
        cr, uid = self.cr, self.uid
        po_ids = self.po_obj.search(cr, uid, [])
        data = [{'data': {
            'user_id': uid,
            'name': 'ORDER NAME TEST 01',
            'pos_session_id': self.session_id,
            'lines': [[0, 0, {
                'product_id': self.evian_product_id,
                'discount': 0,
                'price_unit': 1.26,
                'qty': 5}]],
            'statement_ids': [[0, 0, {
                'journal_id': self.cash_journal_id,
                'amount': 10,
                'name': '2015-01-01 00:00:00',
                'statement_id': self.statement_id,
            }]],
            'amount_paid': 10,
            'amount_tax': 0,
            'amount_return': 3.7,
            'amount_total': 6.3},
        }]
        self.po_obj.create_from_ui(cr, uid, data)
        po = self.po_obj.browse(
            cr, uid, self.po_obj.search(
                cr, uid, [('id', 'not in', po_ids)])[0])
        self.assertEqual(
            po.state, 'paid',
            "Pay an Order In Front Office must create a paid"
            " order in back office")

    def test_02_create_draft_order(self):
        """[Feature] Test if the behaviour when the POS order is
        unpaid works."""
        cr, uid = self.cr, self.uid
        po_ids = self.po_obj.search(cr, uid, [])
        data = [{'data': {
            'user_id': uid,
            'name': 'ORDER NAME TEST 02',
            'pos_session_id': self.session_id,
            'lines': [[0, 0, {
                'product_id': self.evian_product_id,
                'discount': 0,
                'price_unit': 1.26,
                'qty': 5}]],
            'statement_ids': [[0, 0, {
                'journal_id': self.cash_journal_id,
                'amount': 2,
                'name': '2015-01-01 00:00:00',
                'statement_id': self.statement_id,
            }]],
            'amount_paid': 2,
            'amount_tax': 0,
            'amount_return': -4.3,
            'amount_total': 6.3},
        }]
        self.po_obj.create_from_ui(cr, uid, data)
        po = self.po_obj.browse(
            cr, uid, self.po_obj.search(
                cr, uid, [('id', 'not in', po_ids)])[0])
        self.assertEqual(
            po.state, 'draft',
            "An unpaid or partial paid Order In Front Office must create a"
            "draft order in back office.")
