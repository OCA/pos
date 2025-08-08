# Copyright 2025 APSL-Nagarro Antoni Marroig
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    rma_ids = fields.One2many(
        comodel_name="rma",
        inverse_name="pos_order_id",
        string="RMAs",
    )
    rma_count = fields.Integer(
        string="RMA Count",
        compute="_compute_rma_count",
    )

    @api.depends("rma_ids")
    def _compute_rma_count(self):
        for order in self:
            order.rma_count = len(order.rma_ids)

    def action_view_repair_rmas(self):
        return {
            "name": "RMAs - " + self.name,
            "type": "ir.actions.act_window",
            "view_mode": "tree,form",
            "res_model": "rma",
            "domain": [("id", "in", self.rma_ids.ids)],
        }
