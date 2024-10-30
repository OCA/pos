# SPDX-FileCopyrightText: 2024 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_invoice_by_default = fields.Boolean(
        related="pos_config_id.invoice_by_default",
        readonly=False,
    )
