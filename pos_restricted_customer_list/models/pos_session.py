# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models
from odoo.osv import expression


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_partner(self):
        res = super()._loader_params_res_partner()
        res["search_params"]["fields"].extend(["category_id"])
        return res

    def _get_partners_domain(self):
        self.ensure_one()
        domain = super()._get_partners_domain()
        config = self.config_id
        category = config.partner_category_id

        domain = expression.AND(
            [
                domain,
                [
                    ("available_in_pos", "=", True),
                ],
            ]
        )
        if category:
            domain = expression.AND(
                [
                    domain,
                    [
                        ("category_id", "in", category.ids),
                    ],
                ]
            )
        return domain
