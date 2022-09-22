# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):

    _inherit = "pos.config"

    iot_printer_type = fields.Selection(
        selection=[
            ("hw_driver", "Default"),
            ("cups", "Cups"),
        ],
        default="hw_driver",
        string="Printer Type",
        help="""
            * The 'Default' will use the normal behavior of IOT\n
            * The 'Cups' will send the printer name to the IOT\n
            if the printer isn't founded will fall back to the\n
             default behavior.
        """,
    )

    cups_printer_name = fields.Char(
        string="Cups Printer Name",
    )
