# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models
from odoo.tools import float_compare


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_product_product(self):
        res = super()._loader_params_product_product()
        restricted_locations = self._get_restrict_available_product_locations()
        if restricted_locations:
            fields = res.get("search_params", {}).get("fields")
            context = res.get("context", {})
            fields.append("qty_available")
            context["location"] = restricted_locations.ids
            res["context"] = context
            res["fields"] = fields
        return res

    def _get_restrict_available_product_locations(self):
        self.ensure_one()
        Location = self.env["stock.location"]
        config = self.config_id
        if not config.product_restrict_qty_available_location:
            return Location.browse()
        location_ids = config.product_restrict_qty_available_location_ids.ids
        picking_type_location = config.picking_type_id.default_location_src_id
        if picking_type_location:
            location_ids.append(picking_type_location.id)
        return Location.browse(location_ids)

    def _process_pos_ui_product_product(self, products):
        res = super()._process_pos_ui_product_product(products)
        config = self.config_id
        if config.product_restrict_qty_available_location:
            self._process_pos_ui_product_product_remove_unavailable_products(products)
        return res

    def _process_pos_ui_product_product_remove_unavailable_products(self, products):
        for product in products[:]:
            if self._process_pos_ui_product_product_check_remove_unavailable_products(
                product
            ):
                products.remove(product)

    def _process_pos_ui_product_product_check_remove_unavailable_products(
        self, product
    ):
        digits = self.env["decimal.precision"].precision_get("Product Unit of Measure")
        qty_available = product.get("qty_available")
        return (
            product.get("type") == "product"
            and qty_available is not None
            and float_compare(qty_available, 0, precision_digits=digits) <= 0
        )
