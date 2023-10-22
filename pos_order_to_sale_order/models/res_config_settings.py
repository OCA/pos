# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    pos_iface_create_draft_sale_order = fields.Boolean(
        related="pos_config_id.iface_create_draft_sale_order", readonly=False
    )

    pos_iface_create_confirmed_sale_order = fields.Boolean(
        related="pos_config_id.iface_create_confirmed_sale_order", readonly=False
    )

    pos_iface_create_delivered_sale_order = fields.Boolean(
        related="pos_config_id.iface_create_delivered_sale_order", readonly=False
    )

    pos_iface_create_invoiced_sale_order = fields.Boolean(
        related="pos_config_id.iface_create_invoiced_sale_order", readonly=False
    )

    sol_name_mode = fields.Selection(
        selection=[
            ("product_pos", "Product name + POS Comment"),
            ("multiline", "Sale Multiline Description"),
        ],
        string="SO Line Name Mode",
        default="product_pos",
        config_parameter="pos_order_to_sale_order.sol_name_mode",
    )

    @api.model
    def set_values(self):
        result = super(ResConfigSettings, self).set_values()
        ICPSudo = self.env["ir.config_parameter"].sudo()
        value = self.sol_name_mode or "product_pos"
        ICPSudo.set_param("pos_order_to_sale_order.sol_name_mode", value)
        return result
