# Copyright <YEAR(S)> <AUTHOR(S)>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"
    
    @api.model
    def search_paid_order_ids(self, config_id, domain, limit, offset):
        domain = [("pos_reference", "!=", False), ("lines", "!=", False)]
        res = super(PosOrder, self).search_paid_order_ids(config_id, domain, limit, offset)
        return res