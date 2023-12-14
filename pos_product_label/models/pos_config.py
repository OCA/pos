# Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_product_label = fields.Boolean(
        string="Print Product Labels",
        help="Display a button to print Product Labels for ordered products",
        default=True,
    )
