# Copyright 2022 Moka Tourisme (https://www.mokatourisme.fr).
# @author Pierre Verkest <pierreverkest84@gmail.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    zipcode = fields.Char("Zip")

    @api.model
    def _order_fields(self, ui_order):
        data = super()._order_fields(ui_order)
        data["zipcode"] = ui_order.get("zipcode", "")
        return data
