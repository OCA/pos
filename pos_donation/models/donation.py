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
    pos_payment_method_ids = fields.Many2many(
        "pos.payment.method",
        string="PoS Payment Methods",
        compute="_compute_pos_payment_method_ids",
    )
    displayed_payment_mode = fields.Char(
        # non-breaking space here to avoid warning (because this is done on
        # purpose): Two fields (displayed_payment_mode, payment_mode_id) of
        # donation.donation() have the same label: Payment Mode. [Modules:
        # pos_donation and donation]
        string="Payment Mode",
        compute="_compute_displayed_payment_mode",
    )

    @api.depends("pos_order_id.payment_ids.payment_method_id")
    def _compute_pos_payment_method_ids(self):
        for rec in self:
            rec.pos_payment_method_ids = rec.pos_order_id.payment_ids.payment_method_id

    @api.depends("pos_order_id.payment_ids.payment_method_id", "payment_mode_id")
    def _compute_displayed_payment_mode(self):
        for donation in self:
            if donation.pos_payment_method_ids:
                if len(donation.pos_payment_method_ids) > 1:
                    donation.displayed_payment_mode = _("Various")
                else:
                    donation.displayed_payment_mode = (
                        donation.pos_payment_method_ids.name
                    )
            else:
                donation.displayed_payment_mode = donation.payment_mode_id.name

    def action_view_pos_order_id(self):
        return {
            "type": "ir.actions.act_window",
            "name": _("PoS Order"),
            "res_model": "pos.order",
            "view_mode": "tree,form",
            "domain": [("id", "=", self.pos_order_id.id)],
        }
