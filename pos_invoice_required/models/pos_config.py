# Copyright (C) 2023-Today Level Prime Srl (<http://www.levelprime.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    require_invoice = fields.Selection(
        [("no", "No Invoice"), ("optional", "Optional"), ("required", "Required")],
        string="Require Invoice",
        default="optional",
    )

    @api.onchange("module_account")
    def _onchange_module_account(self):
        super(PosConfig, self)._onchange_module_account()
        if not self.module_account:
            self.require_invoice = "no"
