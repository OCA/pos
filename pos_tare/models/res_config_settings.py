# SPDX-FileCopyrightText: 2024 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_iface_tare_method = fields.Selection(
        related="pos_config_id.iface_tare_method", readonly=False
    )
    pos_iface_gross_weight_method = fields.Selection(
        related="pos_config_id.iface_gross_weight_method", readonly=False
    )
    pos_iface_tare_uom_id = fields.Many2one(
        related="pos_config_id.iface_tare_uom_id", readonly=False
    )
