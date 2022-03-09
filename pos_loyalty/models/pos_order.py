# Copyright 2004-2010 OpenERP SA
# Copyright 2017 RGB Consulting S.L. (https://www.rgbconsulting.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models, api


class PosOrder(models.Model):
    _inherit = 'pos.order'

    loyalty_points = fields.Float(string='Loyalty Points',
                                  help='The amount of Loyalty points awarded '
                                       'to the customer with this order')

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        res['loyalty_points'] = ui_order.get('loyalty_points', 0)
        return res
