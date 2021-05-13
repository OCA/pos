# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosPaymentChangeWizardLine(models.TransientModel):
    _name = "pos.payment.change.wizard.new.line"
    _description = "PoS Payment Change Wizard New Line"

    wizard_id = fields.Many2one(
        comodel_name="pos.payment.change.wizard", required=True,
        ondelete='cascade'
    )

    new_journal_id = fields.Many2one(
        comodel_name="account.journal",
        string="Journal",
        required=True,
        domain=lambda s: s._domain_new_journal_id(),
    )

    company_currency_id = fields.Many2one(
        comodel_name='res.currency', store=True,
        related='new_journal_id.currency_id',
        string="Company Currency", readonly=True,
        help='Utility field to express amount currency'
    )

    amount = fields.Monetary(
        string="Amount",
        required=True, default=0.0,
        currency_field='company_currency_id'
    )

    @api.model
    def _domain_new_journal_id(self):
        PosOrder = self.env["pos.order"]
        order = PosOrder.browse(self.env.context.get("active_id"))
        return [("id", "in", order.mapped(
            "session_id.statement_ids.journal_id").ids)]

    # View Section
    @api.model
    def default_get(self, fields):
        res = super().default_get(fields)
        if "new_line_ids" not in self._context:
            return res
        balance = self._context.get("amount_total", 0.0)
        for line in self.wizard_id.resolve_2many_commands(
                "new_line_ids",
                self._context["new_line_ids"],
                fields=["amount"]):
            balance -= line.get("amount")
        res.update({'amount': balance})
        return res
