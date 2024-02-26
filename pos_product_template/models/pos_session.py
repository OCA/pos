from odoo import api, models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_pos_config(self):
        params = super()._loader_params_pos_config()
        if params.get("search_params", {}).get("fields"):
            params.get("search_params", {}).get("fields").append(
                "iface_product_template_show_variants"
            )
        return params

    @api.model
    def _pos_ui_models_to_load(self):
        models_to_load = super()._pos_ui_models_to_load()
        models_to_load.append("product.template")
        models_to_load.append("product.attribute")
        models_to_load.append("product.attribute.value")
        models_to_load.append("product.template.attribute.value")
        return models_to_load

    def _loader_params_product_product(self):
        params = super()._loader_params_product_product()
        params["search_params"]["fields"].append("name")
        params["search_params"]["fields"].append("product_template_attribute_value_ids")
        return params

    def _get_pos_ui_product_template(self, params):
        return self.env["product.template"].search_read(**params["search_params"])

    def _loader_params_product_template(self):
        return {
            "search_params": {
                "domain": [("sale_ok", "=", True), ("available_in_pos", "=", True)],
                "fields": [
                    "name",
                    "display_name",
                    "product_variant_ids",
                    "product_variant_count",
                ],
            },
        }

    def _get_pos_ui_product_attribute(self, params):
        return self.env["product.attribute"].search_read(**params["search_params"])

    def _loader_params_product_attribute(self):
        return {
            "search_params": {
                "fields": ["name", "value_ids", "sequence"],
            },
        }

    def _get_pos_ui_product_attribute_value(self, params):
        return self.env["product.attribute.value"].search_read(
            **params["search_params"]
        )

    def _loader_params_product_attribute_value(self):
        return {
            "search_params": {
                "fields": ["name", "attribute_id"],
            },
        }

    def _get_pos_ui_product_template_attribute_value(self, params):
        return self.env["product.template.attribute.value"].search_read(
            **params["search_params"]
        )

    def _loader_params_product_template_attribute_value(self):
        return {
            "search_params": {
                "domain": [("product_tmpl_id.available_in_pos", "=", True)],
                "fields": [
                    "name",
                    "attribute_id",
                    "product_tmpl_id",
                    "product_attribute_value_id",
                    "ptav_product_variant_ids",
                ],
            },
        }
