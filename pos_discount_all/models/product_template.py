# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    is_discount = fields.Boolean(
        string="Is a Discount",
        help="Check this box if you use this product to realize"
        " discount on sale. If check the sale lines will be"
        " ignored when computing the amount without discount."
        " If you use 'Pos Discount' Odoo module, you should"
        " check this box for the product you configured"
        " as the 'Discount Product' on your PoS config.",
    )
