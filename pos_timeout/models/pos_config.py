# -*- coding: utf-8 -*-
# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# Copyright (C) 2019 ACSONE SA/NV (<http://acsone.eu>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    pos_order_timeout = fields.Integer(
        string='PoS Order Timeout', help="Define the timeout for"
        " the creation of PoS Order in the Front Office UI.\n"
        " The value is expressed in seconds.\n"
        " If not defined, the default Odoo value will be used (7.5 seconds).")
