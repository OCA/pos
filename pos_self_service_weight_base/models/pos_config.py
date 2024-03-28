# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    is_self_service_weight_point = fields.Boolean(
        string="Is Self-Service",
        help="Use this POS as self-service weight point",
    )
