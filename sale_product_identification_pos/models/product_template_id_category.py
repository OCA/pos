# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


from odoo import api, models


class ProductTemplateIdcategory(models.Model):
    _name = "product.template.id_category"
    _inherit = ["product.template.id_category", "pos.load.mixin"]

    @api.model
    def _load_pos_data_fields(self, config):
        return ["id", "category_id", "is_mandatory", "message"]
