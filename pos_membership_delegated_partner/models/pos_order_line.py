# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later
from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    delegated_member_id = fields.Many2one(comodel_name="res.partner")

    def _export_for_ui(self, orderline):
        res = super()._export_for_ui(orderline)
        res["delegated_member_id"] = orderline.delegated_member_id.id
        return res
