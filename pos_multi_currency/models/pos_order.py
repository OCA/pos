# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class PosOrder(models.Model):
    _inherit = "pos.order"

    def _payment_fields(self, order, ui_paymentline):
        """Map one UI payment line, including a foreign tender when present.

        :param order: ``pos.order`` values being created
        :param dict ui_paymentline: payment line from the Point of Sale UI
        :return: ``pos.payment`` create values
        :rtype: dict
        """
        fields_vals = super()._payment_fields(order, ui_paymentline)
        currency_id = ui_paymentline.get("foreign_currency_id")
        if currency_id:
            fields_vals.update(
                {
                    "foreign_currency_id": currency_id,
                    "amount_currency": ui_paymentline.get("amount_currency") or 0.0,
                    "foreign_currency_rate": ui_paymentline.get("foreign_currency_rate")
                    or 0.0,
                }
            )
        return fields_vals

    def _get_valid_session(self, order):
        """Return the session that will own the order, with a rescue opening.

        A rescue session with cash control carries the previous foreign
        opening before the order is stored.

        :param dict order: UI order being created
        :return: ``pos.session`` record
        """
        session = super()._get_valid_session(order)
        if session.rescue and session.config_id.cash_control:
            session._set_foreign_rescue_opening()
        return session
