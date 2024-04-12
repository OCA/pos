# SPDX-FileCopyrightText: 2023 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_is_self_service_weighing_point = fields.Boolean(
        related="pos_config_id.is_self_service_weighing_point", readonly=False
    )
