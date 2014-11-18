# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Order Pricelist Change for Odoo
#    Copyright (C) 2014 GRAP (http://www.grap.coop)
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

from openerp.tests.common import TransactionCase


class TestPosOrderPricelistChange(TransactionCase):
    """Tests for Point Of Sale - Order Pricelist Change Module"""

    def setUp(self):
        super(TestPosOrderPricelistChange, self).setUp()
        self.imd_obj = self.registry('ir.model.data')
        self.pp_obj = self.registry('product.product')
        self.ppl_obj = self.registry('product.pricelist')
        self.po_obj = self.registry('pos.order')
        self.pol_obj = self.registry('pos.order.line')
        self.pc_obj = self.registry('pos.config')
        self.ps_obj = self.registry('pos.session')

    # Test Section
    def test_01_default_price_list(self):
        """[Regression Test] Sale with default Pricelist"""
        cr, uid = self.cr, self.uid
        # Getting object
        pc_id = self.imd_obj.get_object_reference(
            cr, uid, 'point_of_sale', 'pos_config_main')[1]
        rp_c2c_id = self.imd_obj.get_object_reference(
            cr, uid, 'base', 'res_partner_12')[1]
        ppl_c2c_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'list0')[1]
        pp_usb_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'product_product_48')[1]

        # Opening Session
        self.ps_obj.create(cr, uid, {
            'config_id': pc_id,
        })

        # create Pos Order
        po_id = self.po_obj.create(cr, uid, {
            'partner_id': rp_c2c_id,
            'pricelist_id': ppl_c2c_id,
            'lines': [[0, False, {
                'product_id': pp_usb_id,
                'qty': 1,
            }]],
        })
        pp_usb = self.pp_obj.browse(cr, uid, pp_usb_id)
        po = self.po_obj.browse(cr, uid, po_id)

        res = self.pol_obj.onchange_product_id(
            cr, uid, po.lines[0].id, po.pricelist_id.id,
            po.lines[0].product_id.id, po.lines[0].qty)

        self.assertEquals(
            res['value']['price_subtotal'], pp_usb.list_price,
            "Incorrect price for default pricelist!")

    def test_02_partner_with_price_list_before(self):
        """[Regression Test] Sale with specific Pricelist"""
        cr, uid = self.cr, self.uid
        # Getting object
        pc_id = self.imd_obj.get_object_reference(
            cr, uid, 'point_of_sale', 'pos_config_main')[1]
        rp_spe_id = self.imd_obj.get_object_reference(
            cr, uid, 'pos_order_pricelist_change', 'partner_surcharge')[1]
        ppl_spe_id = self.imd_obj.get_object_reference(
            cr, uid, 'pos_order_pricelist_change', 'pricelist_surcharge')[1]
        pp_usb_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'product_product_48')[1]

        # Opening Session
        self.ps_obj.create(cr, uid, {
            'config_id': pc_id,
        })

        # create Pos Order
        po_id = self.po_obj.create(cr, uid, {
            'partner_id': rp_spe_id,
            'pricelist_id': ppl_spe_id,
            'lines': [[0, False, {
                'product_id': pp_usb_id,
                'qty': 1,
            }]],
        })
        pp_usb = self.pp_obj.browse(cr, uid, pp_usb_id)
        po = self.po_obj.browse(cr, uid, po_id)

        res = self.pol_obj.onchange_product_id(
            cr, uid, po.lines[0].id, po.pricelist_id.id,
            po.lines[0].product_id.id, po.lines[0].qty)
        self.assertEquals(
            res['value']['price_subtotal'], pp_usb.list_price + 10,
            "Incorrect price for specific pricelist!")

    def test_03_partner_with_price_list_after(self):
        """[Functional Test] Change pricelist after have set lines."""
        cr, uid = self.cr, self.uid
        # Getting object
        pc_id = self.imd_obj.get_object_reference(
            cr, uid, 'point_of_sale', 'pos_config_main')[1]
        ppl_spe_id = self.imd_obj.get_object_reference(
            cr, uid, 'pos_order_pricelist_change', 'pricelist_surcharge')[1]
        ppl_c2c_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'list0')[1]
        pp_usb_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'product_product_48')[1]

        # Opening Session
        self.ps_obj.create(cr, uid, {
            'config_id': pc_id,
        })

        # create Pos Order
        po_id = self.po_obj.create(cr, uid, {
            'pricelist_id': ppl_c2c_id,
            'lines': [[0, False, {
                'product_id': pp_usb_id,
                'qty': 1,
            }]],
        })
        po = self.po_obj.browse(cr, uid, po_id)

        res = self.po_obj.onchange_pricelist_id(
            cr, uid, po.id, ppl_spe_id, po.lines)
        self.assertNotEquals(
            res.get('warning', False), False,
            "Need warning!")
        pp_usb = self.pp_obj.browse(cr, uid, pp_usb_id)

        # Change now pricelist
        self.po_obj.write(cr, uid, [po_id], {'pricelist_id': ppl_spe_id})
        self.po_obj.action_recompute_pricelist(cr, uid, [po.id])
        po = self.po_obj.browse(cr, uid, po_id)
        self.assertEquals(
            po.amount_total, pp_usb.list_price + 10,
            "Recompute with pricelist error")

    def test_04_partner_without_price_list_after(self):
        """[Functional Test] Unset pricelist after have set lines."""
        cr, uid = self.cr, self.uid
        # Getting object
        pc_id = self.imd_obj.get_object_reference(
            cr, uid, 'point_of_sale', 'pos_config_main')[1]
        pp_usb_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'product_product_48')[1]
        ppl_c2c_id = self.imd_obj.get_object_reference(
            cr, uid, 'product', 'list0')[1]

        # Opening Session
        self.ps_obj.create(cr, uid, {
            'config_id': pc_id,
        })

        # create Pos Order
        po_id = self.po_obj.create(cr, uid, {
            'pricelist_id': ppl_c2c_id,
            'lines': [[0, False, {
                'product_id': pp_usb_id,
                'qty': 1,
            }]],
        })
        po = self.po_obj.browse(cr, uid, po_id)

        res = self.po_obj.onchange_pricelist_id(
            cr, uid, po.id, False, po.lines)
        self.assertEquals(
            res.get('warning', False), False,
            "Doesn't need warning!")
