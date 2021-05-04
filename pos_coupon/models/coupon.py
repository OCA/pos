# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import _, api, fields, models


class Coupon(models.Model):
    _inherit = "sale.coupon"

    source_pos_order_id = fields.Many2one(
        "pos.order",
        string="PoS Order Reference",
        help="PoS order where this coupon is generated.",
    )
    pos_order_id = fields.Many2one(
        "pos.order",
        string="Applied on PoS Order",
        help="PoS order where this coupon is consumed/booked.",
    )

    def _check_coupon_code_generic(self, order_date, partner_id, **kwargs):
        """
        Check the validity of this single coupon.

        :param order_date Date:
        :param partner_id int | boolean:

        Note: This is a backport of 15.0 method _check_coupon_code, because its
        signature changed a lot and thus we can no longer overload the original
        method in 13.0
        """
        self.ensure_one()
        message = {}
        # Part of 15.0 pos_coupon module
        if self.program_id.id in kwargs.get("reserved_program_ids", []):
            return {
                "error": _(
                    "A coupon from the same program has already "
                    "been reserved for this order."
                )
            }
        # Part of 15.0 coupon module
        if self.state == "used":
            message = {
                "error": _("This coupon has already been used (%s).") % (self.code)
            }
        elif self.state == "reserved":
            message = {
                "error": _(
                    "This coupon %s exists but the origin sales order "
                    "is not validated yet."
                )
                % (self.code)
            }
        elif self.state == "cancel":
            message = {"error": _("This coupon has been cancelled (%s).") % (self.code)}
        elif self.state == "expired" or (
            self.expiration_date and self.expiration_date < order_date
        ):
            message = {"error": _("This coupon is expired (%s).") % (self.code)}
        elif not self.program_id.active:
            message = {
                "error": _("The coupon program for %s is in draft or closed state")
                % (self.code)
            }
        elif self.partner_id and self.partner_id.id != partner_id:
            message = {"error": _("Invalid partner.")}
        return message

    def _get_default_template(self):
        if self.source_pos_order_id:
            return self.env.ref("pos_coupon.mail_coupon_template", False)
        return super()._get_default_template()

    @api.model
    def _generate_code(self):
        """
        Modify the generated barcode to be compatible with the default
        barcode rule in this module. See `data/default_barcode_patterns.xml`.
        """
        code = super()._generate_code()
        return "043" + code[3:]
