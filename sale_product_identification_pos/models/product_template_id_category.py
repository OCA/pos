# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


from odoo import models


class ProductTemplateIdcategory(models.Model):
    _inherit = "product.template.id_category"

    def _load_pos_data(self, data):
        fields = ["id", "category_id", "is_mandatory", "message"]
        return {
            "data": self.search_read([], fields, load=False),
            "fields": fields,
        }
