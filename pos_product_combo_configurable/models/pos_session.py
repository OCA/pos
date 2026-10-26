# Copyright 2026 Acysos S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        if "product.combo.pack" not in result:
            result.append("product.combo.pack")
        return result

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        fields_to_load = result.get("search_params", {}).get("fields", [])
        for field_name in ("is_combo", "combo_pack_ids"):
            if field_name not in fields_to_load:
                fields_to_load.append(field_name)
        return result

    def _loader_params_product_combo_pack(self):
        return {
            "search_params": {
                "domain": [("product_tmpl_id.is_combo", "=", True)],
                "fields": [
                    "id",
                    "sequence",
                    "product_tmpl_id",
                    "is_required",
                    "include_price",
                    "include_all_products",
                    "pos_category_id",
                    "product_ids",
                    "default_qty",
                    "no_of_items",
                ],
                "order": "sequence, id",
            }
        }

    def _get_pos_ui_product_combo_pack(self, params):
        return self.env["product.combo.pack"].search_read(**params["search_params"])
