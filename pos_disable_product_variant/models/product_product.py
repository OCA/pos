# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

from odoo import api, fields, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    available_in_pos = fields.Boolean(
        "Available in POS",
        help="Check if you want this product to appear in the Point of Sale."
        "If it's disabled at product level, changing the value here won't have any effect.",
        default=None,
    )
    template_in_pos = fields.Boolean(related="product_tmpl_id.available_in_pos")

    @api.model_create_multi
    def create(self, vals_list):
        products = super().create(vals_list)
        for product, vals in zip(products, vals_list):
            if "available_in_pos" not in vals:
                product.available_in_pos = product.product_tmpl_id.available_in_pos
        return products


class ProductTemplate(models.Model):
    _inherit = "product.template"

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        # Activate variants in POS
        records.filtered("available_in_pos").mapped("product_variant_ids").write(
            {"available_in_pos": True}
        )
        return records

    def write(self, vals):
        res = super().write(vals)
        if "available_in_pos" in vals:
            # Update variants as well
            self.mapped("product_variant_ids").write(
                {"available_in_pos": vals["available_in_pos"]}
            )
        return res
