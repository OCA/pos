# Copyright 2021 Sunflower IT
# Copyright 2026 Trobz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models
from odoo.osv import expression


class ProductProduct(models.Model):
    _inherit = "product.product"

    deposit_product_id = fields.Many2one(
        "product.product",
        "Deposit",
        domain=[("is_deposit", "!=", False)],
        help="If this product is packaged in a container for which you charge deposit, "
        "add a product here that stands for the deposit",
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields_ = super()._load_pos_data_fields(config_id)
        fields_ += ["is_deposit", "deposit_product_id"]
        return fields_

    @api.model
    def _load_pos_data_domain(self, data):
        domain = super()._load_pos_data_domain(data)
        config_id = self.env["pos.config"].browse(data["pos.config"]["data"][0]["id"])
        deposit_domain = [
            *self.env["product.product"]._check_company_domain(config_id.company_id),
            ("active", "=", True),
            ("available_in_pos", "=", True),
            ("sale_ok", "=", True),
            ("is_deposit", "=", True),
        ]
        return expression.OR([domain, deposit_domain])
