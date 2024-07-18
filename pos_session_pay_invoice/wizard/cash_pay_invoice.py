# Copyright (C) 2017 Creu Blanca
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import api, models


class CashPayInvoice(models.TransientModel):
    _inherit = "cash.pay.invoice"

    def _compute_invoice_domain(self):
        res = super()._compute_invoice_domain()
        # Only allow the payment of invoices of the same expected type.
        # By default, in the module account_cash_invoice, the allowed types are:
        #   - Customer: out_invoice, in_refund
        #   - Vendor: in_invoice, out_refund
        # In this module, we will allow the payment of invoices of the same type
        # according to the context pos_pay_invoice_domain:
        #   - Customer: out_invoice
        #   - Vendor: in_invoice
        #   - Refund: out_refund
        pos_pay_invoice_domain = self.env.context.get("pos_pay_invoice_domain")
        if pos_pay_invoice_domain:
            for wizard in self:
                new_domain = []
                for domain in wizard.invoice_domain:
                    if domain[0] == "move_type":
                        new_domain.append(("move_type", "=", pos_pay_invoice_domain))
                    else:
                        new_domain.append(domain)
                wizard.invoice_domain = new_domain
        return res

    @api.model
    def default_get(self, fields_list):
        values = super().default_get(fields_list)
        if "invoice_type" in fields_list and self.env.context.get(
            "pos_pay_invoice_type"
        ):
            values["invoice_type"] = self.env.context.get("pos_pay_invoice_type")
        return values

    def _prepare_statement_line_vals(self):
        vals = super()._prepare_statement_line_vals()
        if self.env.context.get("pos_session_id"):
            vals["pos_session_id"] = self.env.context.get("pos_session_id")
        return vals
