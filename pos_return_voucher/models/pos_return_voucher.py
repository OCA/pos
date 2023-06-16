# Copyright 2023 Jose Zambudio - Aures Tic <jose@aurestic.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.tools.float_utils import float_is_zero


class PosReturnVoucher(models.Model):
    _name = "pos.return.voucher"
    _description = "POS return voucher"
    _rec_name = "pos_reference"

    order_id = fields.Many2one(
        comodel_name="pos.order",
        string="Created from order",
        index=True,
        readonly=True,
        ondelete="restrict",
    )
    date_order = fields.Datetime(
        related="order_id.date_order",
        readonly=True,
    )
    pos_reference = fields.Char(
        related="order_id.pos_reference",
        readonly=True,
    )
    max_validity_date = fields.Datetime(
        compute="_compute_max_validity_date",
        store=True,
        readonly=True,
    )
    user_id = fields.Many2one(
        comodel_name="res.users",
        string="User",
        default=lambda s: s.env.user,
        ondelete="set null",
    )
    amount = fields.Float(required=True, copy=False)
    remaining_amount = fields.Float(
        compute="_compute_remaining_amount",
        store=True,
        readonly=True,
    )
    redeemed_order_ids = fields.Many2many(
        comodel_name="pos.order",
        relation="pos_order_return_voucher_rel",
        column1="return_voucher_id",
        column2="order_id",
        string="Redeemed on order",
        readonly=True,
    )
    state = fields.Selection(
        selection=[
            ("active", "Active"),
            ("expired", "Expired"),
            ("done", "Done"),
        ],
        compute="_compute_state",
    )

    @api.depends("order_id.date_order")
    def _compute_max_validity_date(self):
        for rec in self:
            if not rec.date_order:
                continue
            config = rec.order_id.session_id.config_id
            if not config.return_voucher_validity:
                rec.max_validity_date = False
                continue
            rec.max_validity_date = fields.Date.add(
                rec.date_order, days=config.return_voucher_validity
            )

    def _compute_state(self):
        now = fields.Datetime.now()
        for rec in self:
            order = rec.order_id
            state = "active"
            if float_is_zero(
                rec.remaining_amount, precision_rounding=order.currency_id.rounding
            ):
                state = "done"
            elif rec.max_validity_date and now > rec.max_validity_date:
                state = "expired"
            rec.state = state

    @api.depends(
        "amount",
        "redeemed_order_ids",
        "redeemed_order_ids.payment_ids",
        "redeemed_order_ids.payment_ids.redeemed_return_voucher_id",
    )
    def _compute_remaining_amount(self):
        for rec in self:
            return_voucher = rec.redeemed_order_ids.payment_ids.filtered(
                lambda payment: (payment.redeemed_return_voucher_id == rec)
            )
            rec.remaining_amount = rec.amount - sum(return_voucher.mapped("amount"))
