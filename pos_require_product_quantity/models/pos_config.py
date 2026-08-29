# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    require_product_quantity = fields.Boolean(
        string="Require product quantity in POS",
        default=True,
    )
