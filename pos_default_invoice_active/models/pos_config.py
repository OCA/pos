# -*- coding: utf-8 -*-
# Copyright (C) 2017-TODAY Camptocamp SA (<http://www.camptocamp.com>).
# @author: Simone Orsi (https://twitter.com/simahawk)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_invoicing_active = fields.Boolean(
        string='Activate invoicing by default'
    )
