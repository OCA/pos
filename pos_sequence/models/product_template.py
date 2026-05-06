# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    pos_sequence = fields.Integer(
        string="POS sequence",
        default=100,
        help="Lower values are displayed first in the Point of Sale product grid.",
    )
