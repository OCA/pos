from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    restrict_price_button = fields.Boolean()
    restrict_price_employee_ids = fields.Many2many(
        comodel_name="hr.employee",
        relation="res_users_price_rel",
        string="Bypass for",
    )

    restrict_discount_button = fields.Boolean()
    restrict_discount_employee_ids = fields.Many2many(
        comodel_name="hr.employee",
        relation="res_users_discount_rel",
        string="Bypass for",
    )
