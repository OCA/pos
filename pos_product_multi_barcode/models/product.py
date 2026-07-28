# Copyright 2022 Akretion (https://www.akretion.com).
# @author Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import json

from odoo import fields, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    # technical field used in POS frontend
    barcodes_json = fields.Char(
        "barcode list", readonly=True, compute="_compute_barcodes_json"
    )

    def _compute_barcodes_json(self):
        for product in self:
            barcodes = [barcode for barcode in product.mapped("barcode_ids.name")]
            product.barcodes_json = json.dumps(barcodes)
