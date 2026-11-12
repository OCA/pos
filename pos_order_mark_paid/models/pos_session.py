# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, models
from odoo.tools import float_is_zero


class PosSession(models.Model):
    _inherit = "pos.session"

    def _accumulate_amounts(self, data):
        """Add the write-offs of the non-invoiced orders to the closing data.

        Invoiced orders get their write-off on the invoice instead.

        :param dict data: closing data
        :return: closing data with the ``write_off`` amounts
        :rtype: dict
        """
        data = super()._accumulate_amounts(data)
        write_off = {"amount": 0.0, "amount_converted": 0.0}
        for order in self._get_closed_orders().filtered(
            lambda o: o.write_off_amount and not o.is_invoiced
        ):
            write_off = self._update_amounts(
                write_off, {"amount": order.write_off_amount}, order.date_order
            )
        data["write_off"] = write_off
        return data

    def _create_non_reconciliable_move_lines(self, data):
        """Debit the write-offs on the write-off account of the Point of Sale.

        :param dict data: closing data
        :return: closing data
        :rtype: dict
        """
        data = super()._create_non_reconciliable_move_lines(data)
        write_off = data["write_off"]
        rounding = self.currency_id.rounding
        if not float_is_zero(
            write_off["amount"], precision_rounding=rounding
        ) or not float_is_zero(
            write_off["amount_converted"], precision_rounding=rounding
        ):
            data["MoveLine"].create(
                self._debit_amounts(
                    {
                        "name": _("Write-off"),
                        "move_id": self.move_id.id,
                        "account_id": self.config_id.mark_paid_account_id.id,
                    },
                    write_off["amount"],
                    write_off["amount_converted"],
                )
            )
        return data

    def _get_total_invoice(self):
        """Return the invoiced total without the write-offs.

        ``amount_paid`` includes the write-off, the invoices do not.

        :return: total of the invoiced orders
        :rtype: float
        """
        return super()._get_total_invoice() - sum(
            self.order_ids.filtered("is_invoiced").mapped("write_off_amount")
        )
