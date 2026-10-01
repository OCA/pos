# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


from odoo import models
from odoo.exceptions import ValidationError


class ResPartnerIdNumber(models.Model):
    _inherit = "res.partner.id_number"

    def validate_identification_pos(self, **params):
        identification_ids = self.env["res.partner.id_category"].browse(
            params.get("identification_ids", [])
        )
        product_ids = self.env["product.product"].browse(params.get("product_ids", []))
        product_templates = product_ids.mapped("product_tmpl_id")
        partner = self.env["res.partner"].browse(params.get("partner_id"))
        order_stub = (
            self.env["sale.order"]
            .with_context(check_company=False)
            .new({"partner_id": partner.id or False})
        )
        if product_templates:
            try:
                product_templates._eval_expression_identification(order_stub)
            except ValidationError as error:
                return {
                    "message": error.args[0],
                    "mandatory": True,
                }
        params.update(
            {
                "compare_identification_ids": identification_ids,
                "product_template_ids": product_templates,
            }
        )
        has_partner = bool(params.get("partner_id"))
        requested_mandatory = bool(params.get("mandatory", False))
        enforce_identification = params.get("enforce_partner_identification")
        if enforce_identification is None:
            enforce_identification = bool(
                self.env["ir.config_parameter"]
                .sudo()
                .get_param(
                    "sale_product_identification_pos.enforce_partner_identification"
                )
            )
        is_blocking = bool(
            requested_mandatory and (has_partner or enforce_identification)
        )
        if has_partner and requested_mandatory:
            identifications = self.validate_identification(**params)
        else:
            identifications = identification_ids
        if identifications:
            message_head = self.env._(
                "The following identifications are required to "
                "validate the order, please verify."
            )
            if not is_blocking:
                message_head = self.env._(
                    "The following identifications require verification,"
                    " please validate before continuing:"
                )
            try:
                message_body = self.message_error_identifications(
                    product_ids.mapped("product_tmpl_id").filtered(
                        lambda x: x.required_identification
                        and x.product_tmpl_category_ids
                    ),
                    identifications.ids,
                    required=params.get("mandatory", False),
                )
            except ValidationError as error:
                return {
                    "message": error.args[0],
                    "mandatory": True,
                }
            message = self.env._("%(message_head)s\n %(identifications)s") % {
                "message_head": message_head,
                "identifications": message_body,
            }
            return {
                "message": message,
                "mandatory": is_blocking,
            }
        return True
