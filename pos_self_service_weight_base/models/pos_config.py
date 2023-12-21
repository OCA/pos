# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_self_service = fields.Boolean(
        string="Is Self-Service",
        help="Use this POS as self-service point",
    )
