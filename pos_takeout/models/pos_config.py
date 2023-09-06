# Copyright 2023 KMEE INFORMATICA LTDA (http://www.kmee.com.br).
# @author: Felipe Zago Rodrigues <felipe.zago@kmee.com.br>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_show_takeout_option = fields.Boolean(
        string="Show Take Out Option",
        help="Shows a button on the POS UI to"
        " set if the customer is eating here, or taking out.",
    )
