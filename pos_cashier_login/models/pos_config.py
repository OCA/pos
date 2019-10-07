# Copyright (C) 2019 by Lambda IS <https://www.lambda-is.com>

from odoo import fields, models


class POSConfig(models.Model):
    _inherit = 'pos.config'

    require_cashier_login = fields.Boolean(
        string='Cashier Login',
        help='Require for cashier to be selected before each new sale')
