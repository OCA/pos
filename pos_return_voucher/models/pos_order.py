# Copyright 2023 Jose Zambudio - Aures Tic <jose@aurestic.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    emitted_return_voucher_id = fields.Many2one(
        comodel_name="pos.return.voucher",
        string="Emitted return voucher",
        readonly=True,
        ondelete="restrict",
    )
    redeemed_return_voucher_ids = fields.Many2many(
        comodel_name="pos.return.voucher",
        relation="pos_order_return_voucher_rel",
        column1="order_id",
        column2="return_voucher_id",
        string="Redeemed return vouchers",
        readonly=True,
    )

    def add_payment(self, data):
        PosReturnVoucher = self.env["pos.return.voucher"]
        payment_method = self.env["pos.payment.method"].browse(
            data.get("payment_method_id", False)
        )
        if payment_method.return_voucher and not data.get("redeemed_return_voucher_id"):
            # emitted
            self.emitted_return_voucher_id = PosReturnVoucher.create(
                {
                    "order_id": data.get("pos_order_id"),
                    "amount": abs(data.get("amount")),
                }
            )
            data["emitted_return_voucher_id"] = self.emitted_return_voucher_id.id
        elif payment_method.return_voucher:
            # redeemed
            self.redeemed_return_voucher_ids |= PosReturnVoucher.browse(
                data.get("redeemed_return_voucher_id", False)
            ).exists()
        return super(PosOrder, self).add_payment(data)

    @api.model
    def _payment_fields(self, order, ui_paymentline):
        fields = super(PosOrder, self)._payment_fields(order, ui_paymentline)
        fields.update(
            {
                "emitted_return_voucher_id": ui_paymentline.get(
                    "emitted_return_voucher_id", False
                ),
                "redeemed_return_voucher_id": ui_paymentline.get(
                    "redeemed_return_voucher_id", False
                ),
            }
        )
        return fields

    def _export_for_ui(self, order):
        data = super(PosOrder, self)._export_for_ui(order)
        emitted_return_voucher = order.emitted_return_voucher_id
        data.update(
            {
                "emitted_return_voucher_id": emitted_return_voucher.id,
                "return_voucher_max_date": emitted_return_voucher.max_validity_date,
            }
        )
        return data
