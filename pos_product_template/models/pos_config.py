# Copyright 2022 Akretion (https://www.akretion.com).
# @author Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_product_template_show_variants = fields.Boolean(
        string="Product template show variants",
        default=True,
        help="If selected the product variant selection screen will show the variants,"
        " else it will only allow to confirm once all the attributes are chosen.",
    )
