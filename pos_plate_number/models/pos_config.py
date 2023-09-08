# Copyright (C) 2023 KMEE (http://www.kmee.com.br)
# @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    use_plate_number = fields.Boolean(string="Use Plate Number")

    plate_number_generation = fields.Selection(
        selection=[
            ("manual", "Manual"),
            ("order", "Order Number"),
        ],
        string="Plate Number Generation",
        default="manual",
    )
