# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    currency_difference_journal_id = fields.Many2one(
        comodel_name="account.journal",
        string="Currency Difference Journal",
        domain="[('type', 'in', ('cash', 'bank'))]",
        help="Journal used to post closing differences in foreign currencies. "
        "When empty, the payment method's own journal is used. "
        "Differences in the Point of Sale currency stay on the method's journal.",
    )

    @api.constrains("currency_difference_journal_id", "company_id")
    def _check_currency_difference_journal_company(self):
        """Keep the currency difference journal in the payment method company.

        :raise ValidationError: the journal belongs to another company
        """
        for method in self:
            journal = method.currency_difference_journal_id
            if journal.company_id and journal.company_id != method.company_id:
                raise ValidationError(
                    _(
                        "The currency difference journal of %(method)s must "
                        "belong to %(company)s.",
                        method=method.display_name,
                        company=method.company_id.display_name,
                    )
                )
