# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later
from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _prepare_invoice_line(self, order_line):
        res = super()._prepare_invoice_line(order_line)
        res["delegated_member_id"] = order_line.delegated_member_id.id
        return res
