# -*- coding: utf-8 -*-
# Copyright 2018 Tecnativa - Jairo Llopis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def _order_fields(self, ui_order):
        result = super(PosOrder, self)._order_fields(ui_order)
        result.setdefault('pricelist_id', ui_order['pricelist_id'])
        return result
