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
        vals = None
        if donations:
            # FIXME: this should be checked in pos
            if not self.partner_id:
                _logger.warning(
                    (
                        "Cannot create donation for pos.order {pos_order} "
                        "because there is no partner linked to the order."
                    ).format(pos_order=self)
                )
                return None
            # FIXME: having multiple products is currently not supported. the
            # default_tax_receipt_option should not be defined on the
            # product.template but on a more global record, like the
            # pos.config.
            if len(donations.product_id) > 1:
                _logger.warning(
                    (
                        "Cannot create donation for pos.order {pos_order} "
                        "because there are multiple donation products in the "
                        "order."
                    ).format(pos_order=self)
                )
                return None
            tax_receipt_option = donations.product_id.default_tax_receipt_option
            vals = {
                "pos_order_id": self.id,
                "partner_id": self.partner_id.id,
                "donation_date": self.date_order,
                "payment_mode_id": False,
                "company_id": self.company_id.id,
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
                    (
                        "Cannot validate donation {donation} based on "
                        "pos.order {pos_order}."
                    ).format(donation=donation, pos_order=self)
                )
        return res
