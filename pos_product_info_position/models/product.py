from odoo import models


class ProductProduct(models.Model):
    _inherit = "product.product"

    def get_product_info_pos(self, price, quantity, pos_config_id):
        res = super().get_product_info_pos(price, quantity, pos_config_id)
        quants = self.env["stock.quant"].search(
            [
                ("product_id", "in", self.ids),
                ("location_id.usage", "=", "internal"),
            ]
        )
        locations = []
        for quant in quants:
            loc = quant.location_id
            locations.append(
                {
                    "location_id": loc.id,
                    "location_name": loc.display_name,
                    "corridor": loc.corridor or "-",
                    "row": loc.row or "-",
                    "rack": loc.rack or "-",
                    "level": loc.level or "-",
                    "posx": loc.posx,
                    "posy": loc.posy,
                    "posz": loc.posz,
                }
            )
        res["positions"] = locations
        return res
