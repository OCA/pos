# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    allowed_membership_category_ids = fields.Many2many(
        string="Allowed Membership categories",
        comodel_name="membership.membership_category",
        help="If set, the product will be sallable only to customer"
        " that belong to the given membership categories",
    )
