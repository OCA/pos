# -*- coding: utf-8 -*-
# Copyright 2004-2010 OpenERP SA
# Copyright 2017 RGB Consulting S.L. (https://www.rgbconsulting.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class LoyaltyProgram(models.Model):
    _name = 'loyalty.program'

    name = fields.Char(string='Loyalty Program Name', size=32, index=True,
                       required=True)
    pp_currency = fields.Float(string='Points per currency',
                               help='Amount of loyalty points given to the '
                                    'customer per sold currency')
    pp_product = fields.Float(string='Points per product',
                              help='Amount of loyalty points given to the '
                                   'customer per product sold')
    pp_order = fields.Float(string='Points per order',
                            help='Amount of loyalty points given to the '
                                 'customer for each point of sale order')
    rounding = fields.Float(string='Points Rounding', default=1,
                            help='Loyalty point amounts will be rounded to '
                                 'multiples of this value')
    rule_ids = fields.One2many(comodel_name='loyalty.rule',
                               inverse_name='loyalty_program_id',
                               string='Rules')
    reward_ids = fields.One2many(comodel_name='loyalty.reward',
                                 inverse_name='loyalty_program_id',
                                 string='Rewards')
