from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    restrict_price_button = fields.Boolean(
        related="pos_config_id.restrict_price_button", readonly=False
    )
    restrict_price_employee_ids = fields.Many2many(
        comodel_name="hr.employee",
        string="Bypass for",
        related="pos_config_id.restrict_price_employee_ids",
        readonly=False,
        domain="[('id', 'in', pos_employee_ids)]",
    )

    restrict_discount_button = fields.Boolean(
        related="pos_config_id.restrict_discount_button", readonly=False
    )

    restrict_discount_employee_ids = fields.Many2many(
        comodel_name="hr.employee",
        string="Bypass for",
        related="pos_config_id.restrict_discount_employee_ids",
        readonly=False,
        domain="[('id', 'in', pos_employee_ids)]",
    )
