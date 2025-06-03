# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import _, fields, models


class DonationDonation(models.Model):
    _inherit = "donation.donation"

    pos_order_id = fields.Many2one(
        string="POS Order",
        comodel_name="pos.order",
    )

    def action_view_pos_order_id(self):
        return {
            "type": "ir.actions.act_window",
            "name": _("POS Order"),
            "res_model": "pos.order",
            "view_mode": "tree,form",
            "domain": [("id", "in", self.pos_order_id.ids)],
        }

    def validate(self):
        """Keep payment_mode_id for donation_in_pos"""
        payment_modes = {}
        for donation in self:
            payment_modes[donation.id] = donation.payment_mode_id
        res = super().validate()
        for donation in self:
            if "donation_in_pos" in donation.line_ids.product_id.mapped(
                "detailed_type"
            ):
                donation.payment_mode_id = payment_modes[donation.id]
        return res
