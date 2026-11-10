# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import json

from odoo import fields, models


class AccountMoveLine(models.Model):
    _inherit = "account.move.line"

    is_combo_subline = fields.Boolean(
        string="Is Combo Sub-Product Line",
        default=False,
    )
    combo_subline_json = fields.Text(
        string="Combo Sub-Products JSON",
    )

    def get_combo_subline_items(self):
        self.ensure_one()
        if not self.combo_subline_json:
            return []
        try:
            return json.loads(self.combo_subline_json)
        except ValueError:
            return []
