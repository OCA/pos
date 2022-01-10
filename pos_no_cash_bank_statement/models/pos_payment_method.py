# Copyright 2021 Akretion France (http://www.akretion.com/)
# @author: Alexis de Lattre <alexis.delattre@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosPaymentMethod(models.Model):
    _inherit = "pos.payment.method"

    cash_journal_id = fields.Many2one(
        domain=[("type", "in", ("bank", "cash"))],
        string="Bank/Cash Journal",
    )
    journal_type_domain = fields.Char(compute="_compute_journal_type_domain")
    bank_statement = fields.Boolean(
        string="Generate Bank Statement",
        help="By default, Odoo will generate a cash register/bank statement "
        "upon POS session closing only for cash payment methods. If you enable "
        "this option for a non-cash payment method, Odoo will generate a bank "
        "statement upon session closing, which will generate accounting entries "
        "in the bank journal, which will be automatically reconciled with the "
        "sale journal entry.",
    )

    @api.model
    def _get_allowed_journal_types(self):
        return ["cash"]

    @api.constrains("is_cash_count", "cash_journal_id", "bank_statement")
    def _check_journal_config(self):
        allowed_cash_types = self._get_allowed_journal_types()
        for method in self:
            if method.is_cash_count:
                if not method.cash_journal_id:
                    raise ValidationError(
                        _("Missing cash journal on cash payment method '%s'.")
                        % method.display_name
                    )
                if method.cash_journal_id.type not in allowed_cash_types:
                    labels = [
                        dict(method.cash_journal_id._fields.get("type").selection).get(
                            t
                        )
                        for t in allowed_cash_types
                    ]
                    raise ValidationError(
                        _(
                            "The journal configured on the cash payment method '%s' "
                            "should one of these types:\n- %s."
                        )
                        % (method.display_name, "\n- ".join(labels))
                    )
            elif method.bank_statement:
                if not method.cash_journal_id:
                    raise ValidationError(
                        _("Missing bank journal on payment method '%s'.")
                        % method.display_name
                    )
                if method.cash_journal_id.type != "bank":
                    raise ValidationError(
                        _(
                            "The journal configured on the payment method '%s' "
                            "should be a bank journal."
                        )
                        % method.display_name
                    )

    # Updating domain via onchange is deprecated in odoo v14
    # That's why I use this computed field
    @api.depends("is_cash_count")
    def _compute_journal_type_domain(self):
        for method in self:
            if method.is_cash_count:
                method.journal_type_domain = "cash"
            else:
                method.journal_type_domain = "bank"

    @api.onchange("is_cash_count")
    def is_cash_count_change(self):
        if self.is_cash_count:
            self.bank_statement = False
            self.cash_journal_id = False
        else:
            self.cash_journal_id = False
