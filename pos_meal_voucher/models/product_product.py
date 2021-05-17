# Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class ProductProduct(models.Model):
    _inherit = 'product.product'

    @api.onchange("categ_id")
    def onchange_categ_id_pos_meal_voucher(self):
        for product in self:
            product.meal_voucher_ok = product.categ_id.meal_voucher_ok
