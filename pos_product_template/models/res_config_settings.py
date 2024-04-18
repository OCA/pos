# Copyright 2024 Dixmit (https://www.dixmit.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    iface_product_template_show_variants = fields.Boolean(
        string="Product template show variants",
        default=True,
        help="If selected the product variant selection screen will show the variants,"
        " else it will only allow to confirm once all the attributes are chosen.",
        related="pos_config_id.iface_product_template_show_variants",
        readonly=False,
    )
