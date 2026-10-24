# Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, models
from odoo.exceptions import UserError


class PosConfig(models.Model):
    _inherit = "pos.config"

    def _check_before_creating_new_session(self):
        res = super()._check_before_creating_new_session()
        # Check that each payment has it receivable account
        for payment_method in self.payment_method_ids:
            if not (
                payment_method.receivable_account_id
                or self.company_id.account_default_pos_receivable_account_id
            ):
                raise UserError(
                    _(
                        "No Receivable account defined."
                        " You can define it globally, for the company, at the PoS"
                        " configuration level, or define it at the payment_method"
                        " level, for  '%(payment_method_name)s'.",
                        payment_method_name=payment_method.name,
                    )
                )

        # Check that each payment method has it according payment account
        for payment_method in self.payment_method_ids.filtered(
            lambda x: x.journal_id and x.journal_id.type != "cash"
        ):
            company = payment_method.journal_id.company_id
            if (
                not payment_method.outstanding_account_id
                and not company.account_journal_payment_debit_account_id
            ):
                raise UserError(
                    _(
                        "No outstanding payments/receipts account for the payment method"
                        " '%(payment_method_name)s'."
                        " Please set the field 'Outstanding Payment' on the payment method"
                        " or the field 'Outstanding Receipts Account' on the company settings.",
                        payment_method_name=payment_method.name,
                    )
                )
        return res
