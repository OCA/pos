# Copyright 2023 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import json

from odoo import fields, models


class ProductPackaging(models.Model):
    _inherit = "product.packaging"

    # Technical field used in POS frontend
    barcodes_json = fields.Char("Barcode List", compute="_compute_barcodes_json")

    def _compute_barcodes_json(self):
        for packaging in self:
            packaging.barcodes_json = json.dumps(packaging.mapped("barcode_ids.name"))
