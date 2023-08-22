from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_iface_sale_order_report_id = fields.Many2one(
        "ir.actions.report",
        related="pos_config_id.iface_sale_order_report_id",
        readonly=False,
    )
    pos_iface_create_sale_order = fields.Boolean(
        related="pos_config_id.iface_create_sale_order",
    )
