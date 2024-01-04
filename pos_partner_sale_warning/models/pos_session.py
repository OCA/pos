# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_partner(self):
        result = super()._loader_params_res_partner()
        if self.user_has_groups("sale.group_warning_sale"):
            result["search_params"]["fields"] += ["sale_warn", "sale_warn_msg"]
        return result
