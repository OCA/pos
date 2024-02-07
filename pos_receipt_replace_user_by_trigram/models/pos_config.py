# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    replace_user_by_trigram = fields.Boolean(
        default=False, string="Replace User by trigram in POS receipt"
    )
