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
        self.imd_obj = self.env['ir.model.data']
        self.pp_obj = self.env['product.product']
        self.ppl_obj = self.env['product.pricelist']
        self.po_obj = self.env['pos.order']
        self.pol_obj = self.env['pos.order.line']
        self.pc_obj = self.env['pos.config']
        self.ps_obj = self.env['pos.session']

        self.pc = self.env.ref('point_of_sale.pos_config_main')
        self.rp_c2c = self.env.ref('base.res_partner_12')
        self.ppl_c2c = self.env.ref('product.list0')
        self.pp_usb = self.env.ref('product.product_product_48')

        self.rp_spe = self.env.ref(
            'pos_order_pricelist_change.partner_surcharge')
        self.ppl_spe = self.env.ref(
            'pos_order_pricelist_change.pricelist_surcharge')

    # Test Section
    def test_01_default_price_list(self):
        """[Regression Test] Sale with default Pricelist"""
        # Opening Session
        self.ps_obj.create({'config_id': self.pc.id})

        # create Pos Order
        po = self.po_obj.create({
            'partner_id': self.rp_c2c.id,
            'pricelist_id': self.ppl_c2c.id,
            'lines': [[0, False, {
                'product_id': self.pp_usb.id,
                'qty': 1,
            }]],
        })
        res = po.lines[0].onchange_product_id(
            po.pricelist_id.id, po.lines[0].product_id.id, po.lines[0].qty)

        self.assertEquals(
            res['value']['price_subtotal'], self.pp_usb.list_price,
            "Incorrect price for default pricelist!")

    def test_02_partner_with_price_list_before(self):
        """[Regression Test] Sale with specific Pricelist"""
        # Opening Session
        self.ps_obj.create({'config_id': self.pc.id})

        # create Pos Order
        po = self.po_obj.create({
            'partner_id': self.rp_spe.id,
            'pricelist_id': self.ppl_spe.id,
            'lines': [[0, False, {
                'product_id': self.pp_usb.id,
                'qty': 1,
            }]],
        })

        res = po.lines[0].onchange_product_id(
            po.pricelist_id.id, po.lines[0].product_id.id, po.lines[0].qty)
        self.assertEquals(
            res['value']['price_subtotal'], self.pp_usb.list_price + 10,
            "Incorrect price for specific pricelist!")

    def test_03_partner_with_price_list_after(self):
        """[Functional Test] Change pricelist after have set lines."""
        # Opening Session
        self.ps_obj.create({'config_id': self.pc.id})

        # create Pos Order
        po = self.po_obj.create({
            'pricelist_id': self.ppl_c2c.id,
            'lines': [[0, False, {
                'product_id': self.pp_usb.id,
                'qty': 1,
            }]],
        })

        res = po.onchange_pricelist_id()
        self.assertNotEquals(
            res.get('warning', False), False,
            "Need warning!")

        # Change now pricelist
        po.write({'pricelist_id': self.ppl_spe.id})
        po.action_recompute_pricelist()
        po = self.po_obj.browse(po.id)
        self.assertEquals(
            po.amount_total, self.pp_usb.list_price + 10,
            "Recompute with pricelist error.")
