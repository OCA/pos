# Copyright 2023 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, fields, models
from odoo.exceptions import UserError
from odoo.tools import float_is_zero


class PosOrder(models.Model):
    _inherit = "pos.order"

    payment_order_id = fields.Many2one("pos.order", readonly=True)

    def _export_for_ui(self, order):
        result = super()._export_for_ui(order)
        result["payment_order_id"] = order.payment_order_id.id
        return result

    def _process_payment_lines(self, pos_order, order, pos_session, draft):
        super()._process_payment_lines(pos_order, order, pos_session, draft)
        prec_acc = order.currency_id.decimal_places
        if (
            not draft
            and float_is_zero(order.amount_paid, prec_acc)
            and pos_order.get("payment_order_id")
        ):
            order.write({"payment_order_id": pos_order["payment_order_id"]})
            cash_payment_method = pos_session.payment_method_ids.filtered(
                "is_cash_count"
            )[:1]
            if not cash_payment_method:
                raise UserError(
                    _(
                        "No cash statement found for this session. Unable to record a multiple order payment."
                    )
                )
            return_payment_vals = {
                "name": _("Multi order payment"),
                "pos_order_id": order.id,
                "amount": order.amount_total,
                "payment_date": fields.Datetime.now(),
                "payment_method_id": cash_payment_method.id,
            }
            order.add_payment(return_payment_vals)
