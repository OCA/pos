# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"

    product_tag_id = fields.Many2one(
        "product.tag",
        string="Product Tag",
        readonly=True,
    )

    def _with(self):
        with_ = super()._with()
        res = (
            (with_ + "," if with_ else "")
            + """
            first_product_tag AS (
                SELECT
                    pt.id AS product_template_id,
                    (array_agg(ptg.id))[1] AS id
                FROM product_template pt
                LEFT JOIN product_tag_product_template_rel ptgpt ON
                    (pt.id = ptgpt.product_template_id)
                LEFT JOIN product_tag ptg ON (ptgpt.product_tag_id = ptg.id)
                GROUP BY pt.id
            )"""
        )
        return res

    def _select(self):
        res = super()._select()
        res += ",fpt.id AS product_tag_id"
        return res

    def _from(self):
        res = super()._from()
        res += "LEFT JOIN first_product_tag fpt ON (pt.id = fpt.product_template_id)"
        return res
