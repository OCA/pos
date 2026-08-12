# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    is_self_service_weighing_station = fields.Boolean(
        string="Is a Self-Service Weighing Station",
        help="Use this PoS as a self-service weighing station",
    )
