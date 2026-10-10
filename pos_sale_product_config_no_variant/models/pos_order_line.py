# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    product_no_variant_attribute_value_ids = fields.Many2many(
        comodel_name="product.template.attribute.value",
        relation="pos_order_line_no_variant_ptav_rel",
        column1="order_line_id",
        column2="ptav_id",
        string="Extra Values",
        compute="_compute_no_variant_attribute_values",
        store=True,
        readonly=True,
    )

    @api.depends("product_id", "attribute_value_ids")
    def _compute_no_variant_attribute_values(self):
        for line in self:
            if not line.product_id:
                line.product_no_variant_attribute_value_ids = False
                continue
            template = line.product_id.product_tmpl_id
            line.product_no_variant_attribute_value_ids = (
                line.attribute_value_ids.filtered(
                    lambda ptav, template=template: ptav.product_tmpl_id == template
                    and ptav.attribute_id.create_variant == "no_variant"
                )
            )
