from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_iface_sale_order_allow_delivery = fields.Boolean(
        related="pos_config_id.iface_sale_order_allow_delivery",
        readonly=False,
    )
    pos_iface_sale_order_delivery_carrier_ids = fields.Many2many(
        related="pos_config_id.iface_sale_order_delivery_carrier_ids",
        comodel_name="delivery.carrier",
        readonly=False,
    )
