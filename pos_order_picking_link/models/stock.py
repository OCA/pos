# -*- coding: utf-8 -*-
# © 2016 KMEE(<http://www.kmee.com.br>)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from openerp import fields, models


class StockPicking(models.Model):
    _inherit = "stock.picking"

    pos_order_ids = fields.One2many(comodel_name='pos.order',
                                    inverse_name='picking_id', copy=False,
                                    string='POS order', readonly=True)
