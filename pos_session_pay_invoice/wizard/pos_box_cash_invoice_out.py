# Copyright (C) 2017 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import api, fields, models
from odoo.fields import first
from odoo.tools import float_is_zero


class CashInvoiceOut(models.TransientModel):
    _name = "pos.box.cash.invoice.out"
    _description = "pos box cash invoice out"

    session_id = fields.Many2one("pos.session", required=True)
    amount = fields.Float(string="Amount", digits=0, required=True)
    move_id = fields.Many2one(
        comodel_name="account.move",
        string="Invoice",
        required=True,
    )
    name = fields.Char(related="move_id.name", readonly=True, string="Reason")
    company_id = fields.Many2one(
        comodel_name="res.company",
        related="session_id.company_id",
        required=True,
        readonly=True,
    )
    currency_id = fields.Many2one(
        comodel_name="res.currency",
        related="session_id.currency_id",
        required=True,
        readonly=True,
    )
    payment_method_ids = fields.Many2many(
        comodel_name="pos.payment.method",
        related="session_id.payment_method_ids",
        string="Payment methods",
    )
    payment_method_id = fields.Many2one(
        comodel_name="pos.payment.method",
        required=True,
        default=lambda self: self._default_payment_method(),
    )
    payment_method_count = fields.Integer(
        compute="_compute_payment_method_count",
        readonly=True,
    )

    @api.depends("payment_method_ids")
    def _compute_payment_method_count(self):
        for record in self:
            record.payment_method_count = len(record.payment_method_ids)

    def _default_payment_method(self):
        session = self.env["pos.session"].browse(
            self.env.context.get("default_session_id")
        )
        return first(session.payment_method_ids)

    @api.onchange("move_id")
    def _onchange_invoice(self):
        if self.move_id:
            self.amount = self.move_id.amount_residual_signed

    def _run_order_vals(self):
        return {
            "amount_total": self.amount,
            "currency_id": self.currency_id.id,
            "partner_id": self.move_id.partner_id.id,
            "account_move": self.move_id.id,
            "session_id": self.session_id.id,
            "amount_tax": 0,
            "amount_paid": self.amount,
            "amount_return": 0,
        }

    def run(self):
        if not float_is_zero(self.amount, precision_rounding=self.currency_id.rounding):
            order = self.env["pos.order"].create(self._run_order_vals())
            order.add_payment(
                {
                    "pos_order_id": order.id,
                    "amount": order._get_rounded_amount(self.amount),
                    "name": self.move_id.name,
                    "payment_method_id": self.payment_method_id.id,
                }
            )
            order.action_pos_order_paid()
            order.state = "invoiced"
        return
