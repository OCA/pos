# Copyright (C) 2024 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, models
from odoo.exceptions import UserError


class PosConfig(models.Model):
    _inherit = "pos.config"

    def _check_before_creating_new_session(self):
        res = super()._check_before_creating_new_session()
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
