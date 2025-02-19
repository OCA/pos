# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_pos_payment_method(self):
        res = super()._loader_params_pos_payment_method()
        res["search_params"]["fields"].append("meal_voucher_type")
        return res

    def _loader_params_product_product(self):
        res = super()._loader_params_product_product()
        res["search_params"]["fields"].append("meal_voucher_ok")
        return res
