from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    payment_credit_limit_restricted_ids = fields.Many2many(
        comodel_name="pos.payment.method",
        relation="pos_config_payment_method_restricted_rel",
        column1="config_id",
        column2="payment_method_id",
        string="Credit Limit Restricted",
    )
