# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

from odoo import _, api, fields, models


class DonationDonation(models.Model):
    _inherit = "donation.donation"

    pos_order_id = fields.Many2one(
        string="PoS Order",
        comodel_name="pos.order",
    )
    pos_payment_ids = fields.Many2many(
        string="PoS payment methods", comodel_name="pos.payment"
    )
    displayed_payment_mode = fields.Char(
        string="Payment Mode",
        compute="_compute_displayed_payment_mode",
    )

    @api.depends("pos_payment_ids", "payment_mode_id")
    def _compute_displayed_payment_mode(self):
        for donation in self:
            if len(donation.pos_payment_ids) > 1:
                donation.displayed_payment_mode = _("Various")
            elif len(donation.pos_payment_ids) == 1:
                donation.displayed_payment_mode = (
                    donation.pos_payment_ids.payment_method_id.name
                )
            else:
                donation.displayed_payment_mode = donation.payment_mode_id.name

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
