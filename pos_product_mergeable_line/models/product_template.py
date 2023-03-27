# Copyright (C) 2023-Today: GRAP (<http://www.grap.coop/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    pos_mergeable_line = fields.Boolean(
        string="Mergeable Line",
        default=True,
        help="If unchecked, the product will never"
        " be merged with a previous line, in the Point of sale.",
    )
