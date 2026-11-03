# SPDX-FileCopyrightText: 2021 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    barcode_label_printer_name = fields.Char(
        string="Printer Name", help="Find in CUPS at http://localhost:631/printers"
    )
    barcode_label_width = fields.Integer(
        string="Label Width",
        required=True,
        default=240,
        help="Width of the contents on the label (in points)",
    )
    barcode_label_height = fields.Integer(
        string="Label Height",
        required=True,
        default=176,
        help="Height of the contents on the label (in points)",
    )
    barcode_label_offset_x = fields.Integer(
        string="Label Offset X",
        required=True,
        default=300,
        help="Origin point of the contents on the label, X coordinate (in points)",
    )
    barcode_label_offset_y = fields.Integer(
        string="Label Offset Y",
        required=True,
        default=16,
        help="Origin point of the contents on the label, Y coordinate (in points)",
    )
    barcode_label_darkness = fields.Integer(
        string="Darkness",
        required=True,
        default=20,
        help="ZPL ~SD (set darkness) command. 0 to 30.",
    )
