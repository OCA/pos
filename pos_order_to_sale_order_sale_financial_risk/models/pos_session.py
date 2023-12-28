# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _get_pos_ui_res_users(self, params):
        data = super()._get_pos_ui_res_users(params)
        # Adding key that checks user has group 'risk exception'
        user = self.env["res.users"].browse(data["id"])
        data["has_role_risk_manager"] = user.has_group(
            "account_financial_risk.group_overpass_partner_risk_exception",
        )
        return data
