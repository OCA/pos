# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    place_id = fields.Many2one(
        string='Place', comodel_name='pos.place')

    @api.model
    def _order_fields(self, ui_order):
        res = super()._order_fields(ui_order)
        res['place_id'] = ui_order.get('place_id', False)
        return res

    def _prepare_invoice(self):
        res = super()._prepare_invoice()
        res["place_id"] = self.place_id.id
        return res
