from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    iface_product_template_show_variants = fields.Boolean(
        related="pos_config_id.iface_product_template_show_variants", readonly=False
    )
