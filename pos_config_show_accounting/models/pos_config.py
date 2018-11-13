# Copyright 2018 Eficent <https://www.eficent.com/>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    is_installed_account_accountant = fields.Boolean(
        compute="_compute_is_installed_account_accountant")

    def _compute_is_installed_account_accountant(self):
        super(PosConfig, self)._compute_is_installed_account_accountant()
        for pos_config in self:
            pos_config.is_installed_account_accountant = True
