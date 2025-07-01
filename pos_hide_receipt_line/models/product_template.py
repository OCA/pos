# Copyright 2025 Binhex - Adasat Torres de León
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    pos_hide_receipt_line = fields.Boolean(
        string="Hide Receipt Line",
        help="If this option is checked,"
        " the product will not appear on the receipt line in the Point of Sale "
        "when the line amount is 0.",
        default=False,
    )
