# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import _, fields, models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    detailed_type = fields.Selection(
        selection_add=[
            ("donation_in_pos", "Donation in POS"),
        ],
        ondelete={
            "donation_in_pos": "set consu",
        },
    )
    default_payment_mode_id = fields.Many2one(
        "account.payment.mode",
        domain="[('company_id', '=', company_id), ('donation', '=', True)]",
        tracking=True,
        default=lambda self: self.env.user.context_donation_payment_mode_id,
    )
    default_tax_receipt_option = fields.Selection(
        [
            ("none", "None"),
            ("each", "For Each Donation"),
            ("annual", "Annual Tax Receipt"),
        ],
        tracking=True,
    )

    _sql_constraints = [
        (
            "check_company_id_for_donation_in_pos",
            """CHECK (
                (detailed_type='donation_in_pos' AND company_id IS NOT NULL)
                OR detailed_type!='donation_in_pos'
            )""",
            _(
                "Product for donation in pos must belong to a company "
                "in ordrer to set default payment mode."
            ),
        )
    ]

    def _detailed_type_mapping(self):
        res = super()._detailed_type_mapping()
        res.update(
            {
                "donation_in_pos": "consu",
            }
        )
        return res
