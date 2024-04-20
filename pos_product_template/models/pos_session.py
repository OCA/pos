# Copyright 2024 Dixmit (https://www.dixmit.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from itertools import groupby

from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result["search_params"]["fields"].append("template_variants")
        result["search_params"]["fields"].append("template_name")
        result["search_params"]["fields"].append("product_template_attribute_value_ids")
        return result

    def _pos_data_process(self, loaded_data):
        res = super()._pos_data_process(loaded_data)
        loaded_data["product.attribute"] = self._load_product_template_values()
        return res

    def _load_product_template_values(self):
        # performance trick: prefetch fields with search_fetch() and fetch()
        product_attributes = self.env["product.attribute"].search_fetch(
            [],
            ["name", "display_type", "sequence"],
        )
        product_template_attribute_values = self.env[
            "product.template.attribute.value"
        ].search_fetch(
            [("attribute_id", "in", product_attributes.ids)],
            [
                "attribute_id",
                "attribute_line_id",
                "product_attribute_value_id",
                "price_extra",
            ],
        )
        product_template_attribute_values.product_attribute_value_id.fetch(
            ["name", "is_custom", "html_color", "image"]
        )

        def key1(ptav):
            return (ptav.attribute_line_id.id, ptav.attribute_id.id)

        def key2(ptav):
            return (ptav.attribute_line_id.id, ptav.attribute_id)

        res = {}
        for key, group in groupby(
            sorted(product_template_attribute_values, key=key1), key=key2
        ):
            attribute_line_id, attribute = key
            values = [
                {
                    **ptav.product_attribute_value_id.read(
                        ["name", "is_custom", "html_color", "image"]
                    )[0],
                    "price_extra": ptav.price_extra,
                    # id of a value should be from the
                    # "product.template.attribute.value" record
                    "id": ptav.id,
                }
                for ptav in list(group)
            ]
            res[attribute_line_id] = {
                "id": attribute_line_id,
                "name": attribute.name,
                "display_type": attribute.display_type,
                "values": values,
                "sequence": attribute.sequence,
            }

        return res
