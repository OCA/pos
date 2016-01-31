# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models, api


class PosConfig(models.Model):
    _inherit = 'pos.config'

    group_pos_negative_qty = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_pos_negative_qty',
        string='Point of Sale - Allow Negative Quantity',
        help="This field is there to pass the id of the 'PoS - Allow Negative"
        " Quantity' Group to the Point of Sale Frontend.")

    group_pos_discount = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_pos_discount',
        string='Point of Sale - Allow Discount',
        help="This field is there to pass the id of the 'PoS - Allow Discount'"
        " Group to the Point of Sale Frontend.")

    group_pos_change_unit_price = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_pos_change_unit_price',
        string='Point of Sale - Allow Unit Price Change',
        help="This field is there to pass the id of the 'PoS - Allow Unit"
        " Price Change' Group to the Point of Sale Frontend.")

    @api.multi
    def _compute_group_pos_negative_qty(self):
        print self.env.ref('pos_access_right.group_pos_negative_qty')
        for config in self:
            self.group_pos_negative_qty = \
                self.env.ref('pos_access_right.group_pos_negative_qty')

    @api.multi
    def _compute_group_pos_discount(self):
        print self.env.ref('pos_access_right.group_pos_discount')
        for config in self:
            self.group_pos_discount = \
                self.env.ref('pos_access_right.group_pos_discount')

    @api.multi
    def _compute_group_pos_change_unit_price(self):
        print self.env.ref('pos_access_right.group_pos_change_unit_price')
        for config in self:
            self.group_pos_change_unit_price = \
                self.env.ref('pos_access_right.group_pos_change_unit_price')
