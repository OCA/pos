# Copyright 2023 Ooops404
# License AGPL-3 - See https://www.gnu.org/licenses/agpl-3.0.html

from odoo import fields, models


class CustomFieldRestriction(models.Model):
    _inherit = "custom.field.restriction"

    apply_in_pos = fields.Boolean()
