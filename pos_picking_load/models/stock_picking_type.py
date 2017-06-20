# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class StockPickingType(models.Model):
    _inherit = 'stock.picking.type'

    available_in_pos = fields.Boolean(
        string='Available in Point Of Sale', help="If checked, associated"
        " pickings will be available in the point of sale, to be changed and"
        " paid in it")
