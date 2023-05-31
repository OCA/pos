# Copyright 2023 Jose Zambudio - Aures Tic <jose@aurestic.es>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api, models
from odoo.osv.expression import AND


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def search_paid_order_ids(self, config_id, domain, limit, offset):
        """Orders paid without reference are filtered so that there is no
        error when exporting them.
        (odoo/odoo/blob/14.0/addons/point_of_sale/models/pos_order.py#L712)"""
        with_ref_domain = [
            ("pos_reference", "!=", False),
        ]
        new_domain = AND([domain, with_ref_domain])
        return super().search_paid_order_ids(
            config_id,
            new_domain,
            limit,
            offset,
        )
