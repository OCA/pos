# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class BarcodeRule(models.Model):
    _inherit = "barcode.rule"

    type = fields.Selection(selection_add=[
        ("meal_voucher_payment", "Meal Voucher Payment")
    ])
