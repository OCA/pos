from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def get_product_info_pos(self, price, quantity, pos_config_id):
        res = super().get_product_info_pos(price, quantity, pos_config_id)
        pos_config = self.env["pos.config"].browse(pos_config_id)
        # Step 1: Get all base locations (including trusted ones)
        base_locations = set()
        if (
            pos_config.picking_type_id
            and pos_config.picking_type_id.default_location_src_id
        ):
            base_locations.add(pos_config.picking_type_id.default_location_src_id.id)
        if pos_config.trusted_config_ids:
            for trusted_config in pos_config.trusted_config_ids:
                picking_type_id = trusted_config.picking_type_id
                if picking_type_id.default_location_src_id:
                    base_locations.add(picking_type_id.default_location_src_id.id)
        # Step 2: Find all internal child locations under those base locations
        location_ids = (
            self.env["stock.location"]
            .search(
                [
                    ("id", "child_of", list(base_locations)),
                    ("usage", "=", "internal"),
                ]
            )
            .ids
        )
        # Step 3: Get quants in those internal locations
        quants = self.env["stock.quant"].read_group(
            domain=[
                ("product_id", "in", self.ids),
                ("location_id", "in", location_ids),
                ("quantity", ">", 0),  # Ignore empty locations
            ],
            fields=["location_id", "product_id", "quantity"],
            groupby=["location_id", "product_id"],
        )
        # Step 4: Map location details
        locations_data = []
        location_model = self.env["stock.location"]
        location_cache = {}
        for quant in quants:
            location_id = quant["location_id"][0]
            if location_id not in location_cache:
                location = location_model.browse(location_id)
                location_cache[location_id] = location
            else:
                location = location_cache[location_id]

            locations_data_dict = {
                "location_id": location.id,
                "location_name": location.display_name,
                "quantity": quant["quantity"],
            }
            if pos_config.module_pos_product_info_position:
                locations_data_dict.update(
                    {
                        "corridor": location.corridor or "-",
                        "row": location.row or "-",
                        "rack": location.rack or "-",
                        "level": location.level or "-",
                        "posx": location.posx,
                        "posy": location.posy,
                        "posz": location.posz,
                    }
                )
            locations_data.append(locations_data_dict)
        res["locations"] = locations_data
        return res
