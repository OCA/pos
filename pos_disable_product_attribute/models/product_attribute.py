# Copyright (C) 2023-Today
# @author Emanuel Cino
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import api, fields, models


class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    pos_visibility = fields.Selection(
        [("visible", "Visible"), ("hidden", "Hidden")], default="visible"
    )

    @api.model
    def search(self, domain, offset=0, limit=None, order=None, count=False):
        if self.env.context.get("search_from_pos"):
            domain.append(("pos_visibility", "=", "visible"))
        return super().search(domain, offset, limit, order, count)
