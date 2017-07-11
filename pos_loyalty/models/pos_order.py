# -*- coding: utf-8 -*-
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

    @api.model
    def create_from_ui(self, orders):
        res = super(PosOrder, self).create_from_ui(orders)
        for order in orders:
            order_partner = order['data']['partner_id']
            order_points = order['data']['loyalty_points']
            if order_points != 0 and order_partner:
                partner = self.env['res.partner'].browse(order_partner)
                partner.loyalty_points += order_points
        return res
