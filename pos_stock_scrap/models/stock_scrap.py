# Copyright 2023 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class StockScrap(models.Model):

    _inherit = "stock.scrap"

    @api.model
    def create_and_do_scraps(self, vals):
        product_id = self.env["product.product"].browse(int(vals["product_id"]))
        scraps = self.browse()

        if product_id.variant_bom_ids:
            initial_vals = dict()
            if vals.get("location_id", False):
                initial_vals.update({"location_id": vals["location_id"]})

            if vals.get("scrap_location_id", False):
                initial_vals.update({"scrap_location_id": vals["scrap_location_id"]})

            for line in product_id.variant_bom_ids.mapped("bom_line_ids"):
                scraps |= self.create(
                    {
                        **initial_vals,
                        "product_id": line.product_id.id,
                        "product_uom_id": line.product_uom_id.id,
                        "scrap_qty": line.product_qty * vals["scrap_qty"],
                        "reason_code_id": vals.get("reason_code_id", False),
                    }
                )
        else:
            scraps |= self.create(vals)

        scraps.do_scrap()
        return scraps
