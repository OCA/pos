# Copyright 2022 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class PosComponentSecurity(models.Model):
    _name = "pos.component.security"

    name = fields.Char(
        string="Comonent Name",
        required=True,
    )
