# SPDX-FileCopyrightText: 2025 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import logging

from odoo import Command, models
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _get_donation_vals(self):
        """Return value to create a donation if there is donation
        product in the pos.order. It return None if there is no
        donation product in the pos.order.
        """
        # ensure_one because used in an ensure_one method
        self.ensure_one()
        donations = self.lines.filtered(lambda rec: rec.product_id.is_donation)
        pos_payment_ids = [
            pos_payment_line.payment_method_id.id
            for pos_payment_line in self.payment_ids
        ]
        tax_receipt_option = donations.product_id.default_tax_receipt_option
        company_id = donations.product_id.company_id
        vals = None
        if donations:
            vals = {
                "pos_order_id": self.id,
                "partner_id": self.partner_id.id,
                "donation_date": self.date_order,
                "payment_mode_id": False,
                "pos_payment_ids": [Command.set(pos_payment_ids)],
                "company_id": company_id[0].id if company_id else False,
                "payment_ref": self.pos_reference,
                "tax_receipt_option": tax_receipt_option,
                "line_ids": [],
            }
            for line in donations:
                vals["line_ids"].append(
                    Command.create(
                        {
                            "product_id": line.product_id.id,
                            "quantity": line.qty,
                            "unit_price": line.price_unit,
                        }
                    )
                )
        return vals

    def action_pos_order_paid(self):
        # ensure_one !
        res = super().action_pos_order_paid()
        donation_vals = self._get_donation_vals()
        if donation_vals:
            donation = self.env["donation.donation"].create(donation_vals)
            try:
                donation.validate()
            except UserError:
                _logger.warning(
                    "Cannot validate donation {donation} based on pos.order {pos_order}".format(
                        donation=donation, pos_order=self
                    )
                )
        return res
