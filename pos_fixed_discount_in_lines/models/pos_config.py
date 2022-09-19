from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    split_fixed_discount = fields.Boolean(
        string="Split Fixed Discount Among Lines", default=True
    )
    rounding_product_id = fields.Many2one(
        "product.product",
        string="Rounding Product",
        domain="[('sale_ok', '=', True)]",
        help="The product used for rounding.",
    )
    only_positive_discount = fields.Boolean(
        string="Allow Only Positive Discount", default=False
    )

    @api.onchange("company_id", "split_fixed_discount")
    def _default_discount_product_id(self):
        self.rounding_product_id = self.env.ref(
            "pos_fixed_discount_in_lines.product_fixed_discount_rounding",
            raise_if_not_found=False,
        )
