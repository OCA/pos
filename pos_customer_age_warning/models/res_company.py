from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    age_warning = fields.Integer()
