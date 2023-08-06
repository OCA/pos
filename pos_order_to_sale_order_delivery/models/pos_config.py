from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_sale_order_allow_delivery = fields.Boolean(default=True)
    iface_sale_order_delivery_carrier_ids = fields.Many2many(
        comodel_name="delivery.carrier",
        relation="delivery_carrier_pos_config_rel",
        column1="pos_config_id",
        column2="delivery_carrier_id",
        string="Shipping Methods",
        check_company=True,
    )
