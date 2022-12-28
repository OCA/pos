# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    product_no_variant_attribute_value_ids = fields.Many2many(
        comodel_name="product.template.attribute.value",
        string="Extra Values",
        compute="_compute_no_variant_attribute_values",
        store=True,
        readonly=False,
        precompute=True,
        ondelete="restrict",
    )

    @api.depends("product_id")
    def _compute_no_variant_attribute_values(self):
        for line in self:
            if not line.product_id:
                line.product_no_variant_attribute_value_ids = False
                continue
            if not line.product_no_variant_attribute_value_ids:
                continue
            attribute_lines = (
                line.product_id.product_tmpl_id.valid_product_template_attribute_line_ids
            )
            valid_values = attribute_lines.product_template_value_ids
            # remove the no_variant attributes that don't belong to this template
            for ptav in line.product_no_variant_attribute_value_ids:
                if ptav._origin not in valid_values:
                    line.product_no_variant_attribute_value_ids -= ptav

    def get_product_attribute_value(self, attribute_values, product_tmpl_id):
        return self.env["product.template.attribute.value"].search(
            [
                ("product_attribute_value_id", "in", attribute_values),
                ("product_tmpl_id", "=", product_tmpl_id.id),
            ]
        )

    def _order_line_fields(self, line, session_id=None):
        result = super()._order_line_fields(line, session_id)
        vals = result[2]
        if "product_no_variant_attribute_value_ids" in vals and vals.get(
            "product_no_variant_attribute_value_ids"
        ):
            product_id = self.env["product.product"].browse(vals.get("product_id"))
            vals["product_no_variant_attribute_value_ids"] = [
                [
                    6,
                    False,
                    self.get_product_attribute_value(
                        vals.get("product_no_variant_attribute_value_ids"),
                        product_id.product_tmpl_id,
                    ).mapped(lambda value: value.id),
                ]
            ]
        return result
