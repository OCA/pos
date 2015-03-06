# -*- encoding: utf-8 -*-
##############################################################################
#
#    Pos Invoicing module for Odoo
#    Copyright (C) 2013-Today GRAP (http://www.grap.coop)
#    @author Julien WESTE
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

import time
from openerp import netsvc
from openerp.tests.common import TransactionCase


class TestPosInvoicing(TransactionCase):
    """Tests for POS Invoicing Module"""

    def setUp(self):
        super(TestPosInvoicing, self).setUp()
        cr, uid = self.cr, self.uid

        # Get Registry
        self.imd_obj = self.registry('ir.model.data')
        self.abs_obj = self.registry('account.bank.statement')
        self.pp_obj = self.registry('product.product')
        self.pc_obj = self.registry('pos.config')
        self.ps_obj = self.registry('pos.session')
        self.po_obj = self.registry('pos.order')
        self.ai_obj = self.registry('account.invoice')
        self.pidow_obj = self.registry('pos.invoice.draft.order.wizard')
        self.wf_service = netsvc.LocalService("workflow")

        # Get Object
        self.pc_id = self.imd_obj.get_object_reference(
            cr, uid, 'point_of_sale', 'pos_config_main')[1]
        self.rp_c2c_id = self.imd_obj.get_object_reference(
            cr, uid, 'base', 'res_partner_12')[1]
        self.pp_usb_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'product_product_48')[1]
        self.aj_id = self.imd_obj.get_object_reference(
            cr, uid, 'account', 'cash_journal')[1]

    # Test Section
    def test_01_invoice_with_payment(self):
        """Test the workflow: Draft Order -> Payment -> Invoice"""
        cr, uid = self.cr, self.uid

        # Opening Session
        ps_id = self.ps_obj.create(cr, uid, {
            'config_id': self.pc_id,
        })
        # create Pos Order
        po_id = self.po_obj.create(cr, uid, {
            'partner_id': self.rp_c2c_id,
            'lines': [[0, False, {
                'product_id': self.pp_usb_id,
                'qty': 100,
                'price_unit': 10,
            }]],
        })
        # Realize Partial Payment
        self.po_obj.add_payment(cr, uid, po_id, {
            'journal': self.aj_id,
            'payment_date': time.strftime('%Y-%m-%d'),
            'amount': 500,
        })
        # Sub Test 1 : Try Invoice : Must Fail
        error = False
        try:
            self.po_obj.action_invoice(cr, uid, [po_id])
        except:
            error = True
        self.assertEquals(
            error, True, "A partial paid Pos Order can Not be invoiced!")

        # Finish Payment
        self.po_obj.add_payment(cr, uid, po_id, {
            'journal': self.aj_id,
            'payment_date': time.strftime('%Y-%m-%d'),
            'amount': 500,
        })
        # Mark as Paid
        self.wf_service.trg_validate(uid, 'pos.order', po_id, 'paid', cr)

        # Sub Test 2 : Try Invoice : Must Succeed
        self.po_obj.action_invoice(cr, uid, [po_id])
        po = self.po_obj.browse(cr, uid, po_id)
        self.assertEquals(
            po.invoice_id.id != 0, True,
            "A Paid Pos Order must to be invoiceable!")

        # The Invoice must be unpayable but in 'open' state
        self.assertEquals(
            (po.invoice_id.state == 'open') and po.invoice_id.forbid_payment,
            True, "The invoice created from a paid POS Order must be in a"
            " 'open' state but unpayable, before closing the POS session!")
        inv_id = po.invoice_id.id

        # Close Session
        self.wf_service.trg_validate(uid, 'pos.session', ps_id, 'close', cr)

        # The Invoice must be now but in 'paid' state
        inv = self.ai_obj.browse(cr, uid, inv_id)
        self.assertEquals(
            (inv.state == 'paid'),
            True, "After closing a session, invoices created from Paid POS"
            " Orders must be in a 'paid' status!")

    def test_02_invoice_without_payment(self):
        """Test the workflow: Draft Order -> Invoice"""
        cr, uid = self.cr, self.uid
        # Opening Session
        ps_id = self.ps_obj.create(cr, uid, {
            'config_id': self.pc_id,
        })
        # create Pos Order
        po_id = self.po_obj.create(cr, uid, {
            'partner_id': self.rp_c2c_id,
            'lines': [[0, False, {
                'product_id': self.pp_usb_id,
                'qty': 100,
                'price_unit': 10,
            }]],
        })

        ctx = {
            'active_model': 'pos.order',
            'active_id': po_id,
        }
        self.pidow_obj.invoice_draft_order(cr, uid, False, context=ctx)
        po = self.po_obj.browse(cr, uid, po_id)
        self.assertEquals(
            po.invoice_id.id != 0, True,
            "A Draft Pos Order must to be invoiceable!")

        self.assertEquals(
            po.invoice_id.state == 'open', True,
            "The invoice created from draft Order must be in 'open' State!")

        self.assertEquals(
            po.invoice_id.forbid_payment, False,
            "The invoice created from draft Order must accept Payments!")

        self.assertEquals(
            po.state == 'invoiced', True,
            "A Draft Invoiced Pos Order must to be in the 'invoiced' state!")

        # Close Session
        self.wf_service.trg_validate(uid, 'pos.session', ps_id, 'close', cr)

        # The Invoice must still be in 'open' state
        inv = self.ai_obj.browse(cr, uid, po.invoice_id.id)
        self.assertEquals(
            (inv.state == 'open'),
            True, "After closing a session, invoices created from Draft POS"
            " Orders must be in a 'open' status!")
