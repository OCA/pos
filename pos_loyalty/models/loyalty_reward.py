# -*- coding: utf-8 -*-
# Copyright 2004-2010 OpenERP SA
# Copyright 2017 RGB Consulting S.L. (https://www.rgbconsulting.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models, api, _
from odoo.exceptions import ValidationError


class LoyaltyReward(models.Model):
    _name = 'loyalty.reward'

    name = fields.Char(string='Reward Name', size=32, index=True,
                       required=True)
    type = fields.Selection(selection=[('gift', 'Gift'),
                                       ('discount', 'Discount'),
                                       ('resale', 'Resale')],
                            string='Type', required=True,
                            help='Type of the reward')
    minimum_points = fields.Float(string='Minimum Points',
                                  help='Minimum amount of points the customer'
                                       ' must have to qualify for this reward')
    point_cost = fields.Float(string='Point Cost',
                              help='Cost of the reward per monetary unit '
                                   'discounted')
    discount = fields.Float(help='The discount percentage')
    discount_max = fields.Float(string='Discount limit',
                                help='Maximum discounted amount allowed for'
                                     'this discount reward')
    loyalty_program_id = fields.Many2one(comodel_name='loyalty.program',
                                         string='Loyalty Program',
                                         help='The Loyalty Program this reward'
                                              ' belongs to')
    gift_product_id = fields.Many2one(comodel_name='product.product',
                                      string='Gift Product',
                                      help='The product given as a reward')
    discount_product_id = fields.Many2one(comodel_name='product.product',
                                          string='Discount Product',
                                          help='The product used to apply '
                                               'discounts')
    point_product_id = fields.Many2one(comodel_name='product.product',
                                       string='Point Product',
                                       help='Product that represents a point '
                                            'that is sold by the customer')

    @api.multi
    @api.constrains('type', 'gift_product_id')
    def _check_gift_product(self):
        for reward in self:
            if reward.type == 'gift' and not reward.gift_product_id:
                raise ValidationError(
                    _('Gift product field is mandatory for gift rewards'))

    @api.multi
    @api.constrains('type', 'discount_product_id')
    def _check_discount_product(self):
        for reward in self:
            if reward.type == 'discount' and not reward.discount_product_id:
                raise ValidationError(_('Discount product field is '
                                        'mandatory for discount rewards'))

    @api.multi
    @api.constrains('type', 'point_product_id')
    def _check_point_product(self):
        for reward in self:
            if reward.type == 'resale' and not reward.point_product_id:
                raise ValidationError(_('Point product field is '
                                        'mandatory for point resale rewards'))
