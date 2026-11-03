# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_barcode_label_printer_name = fields.Char(
        related="pos_config_id.barcode_label_printer_name", readonly=False
    )
    pos_barcode_label_width = fields.Integer(
        related="pos_config_id.barcode_label_width", readonly=False
    )
    pos_barcode_label_height = fields.Integer(
        related="pos_config_id.barcode_label_height", readonly=False
    )
    pos_barcode_label_offset_x = fields.Integer(
        related="pos_config_id.barcode_label_offset_x", readonly=False
    )
    pos_barcode_label_offset_y = fields.Integer(
        related="pos_config_id.barcode_label_offset_y", readonly=False
    )
    pos_barcode_label_darkness = fields.Integer(
        related="pos_config_id.barcode_label_darkness", readonly=False
    )
