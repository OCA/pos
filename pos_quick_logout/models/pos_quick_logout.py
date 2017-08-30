# -*- coding: utf-8 -*-

from odoo import models, api, fields, exceptions


class PosConfig(models.Model):
    _inherit = 'pos.config'

    logout_timeout = fields.Integer(
        default=10, string='Logout Timeout',
        help='Time out for automatic logout for sessions in this POS')
