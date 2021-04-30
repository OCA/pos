from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.depends("amount_total", "amount_tax")
    def _compute_untaxed(self):
        for order in self:
            order.amount_untaxed = order.amount_total - order.amount_tax

    amount_untaxed = fields.Float(
        string="Untaxed",
        digits=0,
        readonly=True,
        store=True,
        compute="_compute_untaxed",
    )

    def get_statement_amount(self, statement_id):
        FieldMonetary = self.env["ir.qweb.field.monetary"]
        monetary_options = {
            "display_currency": self.currency_id,
        }
        statement = self.env["account.bank.statement"].browse(statement_id)
        payment = self.payment_ids.filtered(
            lambda p: p.payment_method_id.cash_journal_id == statement.journal_id
        )
        return FieldMonetary.value_to_html(
            sum(p.amount for p in payment) if payment else 0, monetary_options
        )
