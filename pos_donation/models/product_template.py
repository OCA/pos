# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    detailed_type = fields.Selection(
        selection_add=[
            ("donation_in_pos", "Donation in PoS"),
        ],
        ondelete={
            "donation_in_pos": "set consu",
        },
    )
    default_tax_receipt_option = fields.Selection(
        [
            ("none", "None"),
            ("each", "For Each Donation"),
            ("annual", "Annual Tax Receipt"),
        ],
        tracking=True,
    )

    def _detailed_type_mapping(self):
        res = super()._detailed_type_mapping()
        res.update(
            {
                "donation_in_pos": "consu",
            }
        )
        return res
