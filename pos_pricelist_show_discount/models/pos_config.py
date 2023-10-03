from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosConfig(models.Model):
    _inherit = "pos.config"

    display_discount_from_pricelist = fields.Boolean(
        string="Display Discount From Reference Pricelist",
    )
    discount_pricelist_id = fields.Many2one(
        "product.pricelist",
        string="Discount Reference Pricelist",
        help="The pricelist used as reference to calculate discounts.",
    )

    @api.constrains("display_discount_from_pricelist", "discount_pricelist_id")
    def _check_discount_pricelist(self):
        self = self.sudo()
        if (
            self.display_discount_from_pricelist
            and self.discount_pricelist_id
            and self.discount_pricelist_id.company_id
            and self.discount_pricelist_id.company_id != self.company_id
        ):
            raise ValidationError(
                _(
                    "The discount pricelist must belong to no company "
                    "or the company of the point of sale."
                )
            )

    @api.onchange("use_pricelist")
    def _onchange_use_pricelist(self):
        super()._onchange_use_pricelist()
        if not self.use_pricelist:
            self.display_discount_from_pricelist = False

    @api.onchange("available_pricelist_ids")
    def _onchange_available_pricelist_ids(self):
        super()._onchange_available_pricelist_ids()
        if self.discount_pricelist_id not in self.available_pricelist_ids._origin:
            self.discount_pricelist_id = False

    @api.onchange("display_discount_from_pricelist")
    def _onchange_display_discount_from_pricelist(self):
        if not self.display_discount_from_pricelist:
            self.discount_pricelist_id = False

    def _get_forbidden_change_fields(self):
        return super()._get_forbidden_change_fields() + [
            "display_discount_from_pricelist",
            "discount_pricelist_id",
        ]
