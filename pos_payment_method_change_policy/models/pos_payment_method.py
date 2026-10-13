# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# Copyright 2026 CHEF PIXEL
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import logging

from odoo import api, fields, models
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    change_product_id = fields.Many2one(
        comodel_name="product.product",
        domain=[("type", "=", "service"), ("available_in_pos", "=", True)],
        help="Product added as an order line for the overpaid surplus amount.",
    )

    change_policy = fields.Selection(
        selection=[
            ("cash", "Cash"),
            ("profit_product", "Exceptional Profit Product"),
        ],
        required=True,
        default="cash",
    )

    @api.constrains("change_policy", "change_product_id")
    def check_change_product_id(self):
        if self.filtered(
            lambda x: x.change_policy == "profit_product" and not x.change_product_id
        ):
            raise ValidationError(
                self.env.__(
                    "The field 'Change Product' is required"
                    " if the 'Change policy' is set to 'Exceptional Profit Product'."
                )
            )

    def _load_pos_data_fields(self, config_id):
        result = super()._load_pos_data_fields(config_id)
        for field in ["change_policy", "change_product_id"]:
            if field not in result:
                result.append(field)
        return result
