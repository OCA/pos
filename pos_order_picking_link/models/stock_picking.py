# © 2016 KMEE INFORMATICA LTDA (https://kmee.com.br)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import fields, models


class StockPicking(models.Model):
    _inherit = "stock.picking"

    pos_order_ids = fields.One2many(
        comodel_name='pos.order',
        inverse_name='picking_id',
        copy=False,
        string='POS order', readonly=True
    )
