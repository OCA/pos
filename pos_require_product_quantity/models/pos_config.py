# Copyright 2019-2020 Coop IT Easy SCRLfs
# @author Robin Keunen <robin@coopiteasy.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    require_product_quantity = fields.Boolean(
        string="Require product quantity in POS",
        default=False,
    )
