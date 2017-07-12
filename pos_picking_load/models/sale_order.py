# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    final_pos_order_id = fields.Many2one(
        string='Final PoS Order', comodel_name='pos.order', readonly=True,
        help="This Sale Order has beend replaced by this PoS Order")
