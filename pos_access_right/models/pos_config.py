# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models, api


class PosConfig(models.Model):
    _inherit = 'pos.config'

    group_negative_qty_id = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_negative_qty_id',
        string='Point of Sale - Allow Negative Quantity',
        help="This field is there to pass the id of the 'PoS - Allow Negative"
        " Quantity' Group to the Point of Sale Frontend.")

    group_discount_id = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_discount_id',
        string='Point of Sale - Allow Discount',
        help="This field is there to pass the id of the 'PoS - Allow Discount'"
        " Group to the Point of Sale Frontend.")

    group_change_unit_price_id = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_change_unit_price_id',
        string='Point of Sale - Allow Unit Price Change',
        help="This field is there to pass the id of the 'PoS - Allow Unit"
        " Price Change' Group to the Point of Sale Frontend.")

    group_multi_order_id = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_multi_order_id',
        string='Point of Sale - Many Orders',
        help="This field is there to pass the id of the 'PoS - Many Orders"
        " Group to the Point of Sale Frontend.")

    group_delete_order_id = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_delete_order_id',
        string='Point of Sale - Delete Order',
        help="This field is there to pass the id of the 'PoS - Delete Order'"
        " Group to the Point of Sale Frontend.")

    group_payment_id = fields.Many2one(
        comodel_name='res.groups',
        compute='_compute_group_payment_id',
        string='Point of Sale - Payment',
        help="This field is there to pass the id of the 'PoS - Payment'"
        " Group to the Point of Sale Frontend.")

    @api.multi
    def _compute_group_negative_qty_id(self):
        for config in self:
            self.group_negative_qty_id = \
                self.env.ref('pos_access_right.group_negative_qty')

    @api.multi
    def _compute_group_discount_id(self):
        for config in self:
            self.group_discount_id = \
                self.env.ref('pos_access_right.group_discount')

    @api.multi
    def _compute_group_change_unit_price_id(self):
        for config in self:
            self.group_change_unit_price_id = \
                self.env.ref('pos_access_right.group_change_unit_price')

    @api.multi
    def _compute_group_multi_order_id(self):
        for config in self:
            self.group_multi_order_id = \
                self.env.ref('pos_access_right.group_multi_order')

    @api.multi
    def _compute_group_delete_order_id(self):
        for config in self:
            self.group_delete_order_id = \
                self.env.ref('pos_access_right.group_delete_order')

    @api.multi
    def _compute_group_payment_id(self):
        for config in self:
            self.group_payment_id = \
                self.env.ref('pos_access_right.group_payment')
