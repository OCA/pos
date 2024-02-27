# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    change_product_id = fields.Many2one(
        comodel_name="product.product",
        domain=[("type", "=", "service"), ("available_in_pos", "=", True)],
        help="This product will be used if customer"
        " pays more that the amount of the receipt,"
        " to add an extra order line when confirming"
        " order.",
    )

    change_policy = fields.Selection(
        selection=[
            ("cash", "Cash"),
            ("profit_product", "Exceptional Profit Product"),
        ],
        required=True,
        default="cash",
        help="Method of managing the giving of change.\n"
        " * 'Cash': (Default). the cashier will give back"
        " money in cash method.\n"
        " * 'Exceptional Profit Product': an extra PoS Order Line will"
        " be added in the PoS Order of the surplus amount."
        " This will be an exceptional gain for the seller,"
        " and a loss for the customer.",
    )

    @api.constrains("change_policy", "change_product_id")
    def check_change_product_id(self):
        if self.filtered(
            lambda x: x.change_policy == "profit_product" and not x.change_product_id
        ):
            raise ValidationError(
                _(
                    "The field 'Change Product' is required"
                    " if the 'Change policy' is set to 'Exceptional Profit Product'."
                )
            )
