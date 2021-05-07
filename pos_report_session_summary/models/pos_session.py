from odoo import api, fields, models


class PosSession(models.Model):
    _inherit = "pos.session"

    @api.depends("order_ids")
    def _compute_total_orders_amount(self):
        for session in self:
            session.order_amount_untaxed = sum(
                order.amount_untaxed for order in session.order_ids
            )
            session.order_amount_total = sum(
                order.amount_total for order in session.order_ids
            )

    order_amount_untaxed = fields.Float(
        compute="_compute_total_orders_amount",
        string="Total Orders Untaxed",
        store=True,
    )
    order_amount_total = fields.Float(
        compute="_compute_total_orders_amount", string="Total Orders Amount", store=True
    )

    def get_statement_amount(self, statement_id):
        self.ensure_one()
        FieldMonetary = self.env["ir.qweb.field.monetary"]
        monetary_options = {
            "display_currency": self.currency_id,
        }
        statement = self.env["account.bank.statement"].browse(statement_id)
        payments = self.env["pos.payment"]
        for order in self.order_ids:
            payments += order.payment_ids.filtered(
                lambda p: p.payment_method_id.cash_journal_id == statement.journal_id
            )
        return FieldMonetary.value_to_html(
            sum(p.amount for p in payments) if payments else 0, monetary_options
        )
