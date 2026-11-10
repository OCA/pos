from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_iface_automatic_cashdrawer = fields.Boolean(
        related="pos_config_id.iface_automatic_cashdrawer",
        string="Automatic Cashdrawer",
        readonly=False,
    )

    pos_iface_automatic_cashdrawer_ip_address = fields.Char(
        related="pos_config_id.iface_automatic_cashdrawer_ip_address",
        string="Automatic Cashdrawer IP address",
        readonly=False,
    )

    pos_iface_automatic_cashdrawer_tcp_port = fields.Char(
        related="pos_config_id.iface_automatic_cashdrawer_tcp_port",
        string="Automatic Cashdrawer TCP port",
        readonly=False,
    )
