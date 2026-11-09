from odoo import api, fields, models


class PosPayment(models.Model):
    _inherit = "pos.payment"

    fee_line_ids = fields.One2many(
        comodel_name="pos.payment.fee.line",
        inverse_name="payment_id",
        string="Fee Lines",
    )
    total_fee_amount = fields.Monetary(
        string="Total Fees",
        compute="_compute_total_fee_amount",
        store=True,
    )

    @api.depends("fee_line_ids.fee_amount")
    def _compute_total_fee_amount(self):
        for payment in self:
            payment.total_fee_amount = sum(payment.fee_line_ids.mapped("fee_amount"))

    def _create_payment_fee_lines(self):
        """Compute the fees of validated payments, once per payment and rule.

        Fees never change the order, its taxes nor the amount paid by the
        customer: they are an internal financial cost. They are created as
        superuser because POS users compute them while synchronising orders
        without having (nor needing) write access on the fee ledger.
        """
        fee_line_model = self.env["pos.payment.fee.line"].sudo()
        vals_list = []
        for payment in self.sudo():
            method = payment.payment_method_id
            if not method._fees_applicable():
                continue
            applied_rules = payment.fee_line_ids.fee_rule_id
            for rule in method.fee_ids - applied_rules:
                fee_amount, fee_amount_company = rule._get_fee_amounts(payment)
                if payment.currency_id.is_zero(fee_amount):
                    continue
                vals_list.append(
                    fee_line_model._prepare_fee_line_vals(
                        payment, rule, fee_amount, fee_amount_company
                    )
                )
        return fee_line_model.create(vals_list)
