from collections import defaultdict

from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def _get_variant_list(self):
        """Returns a list of product variants grouped by attribute name."""
        self.ensure_one()
        grouped_values = defaultdict(set)
        for line in self.attribute_line_ids:
            attr_name = line.attribute_id.name
            for value in line.value_ids:
                grouped_values[attr_name].add(value.name)
        variant_list = []
        for attr_name, values in grouped_values.items():
            variant_list.append(
                {
                    "name": attr_name,
                    "values": [
                        {
                            "name": value_name,
                            "search": f"{self.name} {value_name}",
                        }
                        for value_name in sorted(values)
                    ],
                }
            )
        return variant_list

    def _get_warehouse_list(self):
        """Returns a list of warehouses with overall quantities and details by location."""
        self.ensure_one()
        product = self
        warehouse_obj = self.env["stock.warehouse"]
        location_obj = self.env["stock.location"]
        warehouses = warehouse_obj.search([])
        warehouse_list = []
        for warehouse in warehouses:
            # Total quantities per warehouse using context
            available_qty = product.with_context(warehouse=warehouse.id).qty_available
            forecasted_qty = product.with_context(
                warehouse=warehouse.id
            ).virtual_available
            # Internal warehouse locations
            internal_locations = location_obj.search(
                [
                    ("usage", "=", "internal"),
                    ("location_id", "child_of", warehouse.view_location_id.id),
                ]
            )
            # Build list of locations
            location_list = []
            for loc in internal_locations:
                loc_id = loc.id
                available = product.with_context(
                    location=loc_id, warehouse=warehouse.id
                ).qty_available
                forecasted = product.with_context(
                    location=loc_id, warehouse=warehouse.id
                ).virtual_available
                # Only show relevant locations (if any exist)
                if available or forecasted:
                    location_list.append(
                        {
                            "name": loc.display_name,
                            "available_quantity": available,
                            "forecasted_quantity": forecasted,
                        }
                    )
            # Build warehouse result
            warehouse_list.append(
                {
                    "name": warehouse.name,
                    "available_quantity": available_qty,
                    "forecasted_quantity": forecasted_qty,
                    "uom": product.uom_id.name,
                    "locations": sorted(location_list, key=lambda x: x["name"]),
                }
            )
        return warehouse_list

    def get_product_info_pos(self, price, quantity, pos_config_id):
        res = super().get_product_info_pos(price, quantity, pos_config_id)
        pos_config = self.env["pos.config"].browse(pos_config_id)
        # Display warehouses with or without locations according to configuration
        if pos_config.display_product_locations:
            res["warehouses"] = self._get_warehouse_list()
        # Group variants with the same attribute
        res["variants"] = self._get_variant_list()
        return res
