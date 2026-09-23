# Copyright 2024 Hunki Enterprises BV
# Copyright 2026 Trobz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    is_container_deposit = fields.Boolean(
        help="Technical field marking this line as a container deposit line "
        "automatically added next to the line it belongs to.",
    )
    container_deposit_line_id = fields.Many2one(
        "pos.order.line",
        string="Container Deposit Line",
        help="Container deposit line automatically added and kept in sync "
        "with this order line.",
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields_ = super()._load_pos_data_fields(config_id)
        fields_ += ["is_container_deposit", "container_deposit_line_id"]
        return fields_
