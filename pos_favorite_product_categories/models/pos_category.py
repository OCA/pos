# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosCategory(models.Model):

    _inherit = "pos.category"

    favorite = fields.Selection(
        selection=[("0", "Normal"), ("1", "Favorite")], default="0"
    )

    only_favorite_bar = fields.Boolean(
        string="Only on Favorite Bar ?",
        help="Check this field if you don't want a favorite category to \
            also appear in the standard category bar.",
    )
