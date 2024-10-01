# Copyright 2024 Camptocamp
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import models


class POSSession(models.Model):
    _inherit = "pos.session"

    def get_pos_ui_partner_pricelist_background(self, pricelist_id, product_ids):
        params = self._loader_params_product_pricelist()
        fnames = params["search_params"]["fields"]
        pricelist_rec = self.env["product.pricelist"].browse(pricelist_id)
        pricelist = pricelist_rec.read(fnames)[0]
        pricelist["items"] = []

        products = (
            self.env["product.product"].browse(product_ids)
            | pricelist_rec.item_ids.product_id
        )
        templates = products.product_tmpl_id | pricelist_rec.item_ids.product_tmpl_id
        pricelist_item_domain = [
            ("pricelist_id", "=", pricelist_id),
            "|",
            ("product_tmpl_id", "=", False),
            ("product_tmpl_id", "in", templates.ids),
            "|",
            ("product_id", "=", False),
            ("product_id", "in", products.ids),
        ]
        for item in self.env["product.pricelist.item"].search_read(
            pricelist_item_domain, self._product_pricelist_item_fields()
        ):
            pricelist["items"].append(item)
        return [pricelist]
