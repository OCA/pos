# Copyright (C) 2015 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosPaymentChangeWizardLine(models.TransientModel):
    _name = "pos.payment.change.wizard.new.line"
    _description = "PoS Payment Change Wizard New Line"

    wizard_id = fields.Many2one(
        comodel_name="pos.payment.change.wizard",
        required=True,
        ondelete="cascade",
    )

    new_payment_method_id = fields.Many2one(
        comodel_name="pos.payment.method",
        string="Payment Method",
        required=True,
        domain="[('id', 'in', available_payment_method_ids)]",
    )

    available_payment_method_ids = fields.Many2many(
        comodel_name="pos.payment.method",
        string="Available Payment Methods",
        help="List of available payment methods for the current POS Order",
        compute="_compute_available_payment_method_ids",
    )

    company_currency_id = fields.Many2one(
        comodel_name="res.currency",
        store=True,
        related="new_payment_method_id.company_id.currency_id",
        string="Company Currency",
        readonly=True,
        help="Utility field to express amount currency",
    )

    amount = fields.Monetary(
        required=True,
        default=0.0,
        currency_field="company_currency_id",
    )

    @api.depends("wizard_id.order_id")
    def _compute_available_payment_method_ids(self):
        for line in self:
            line.available_payment_method_ids = (
                line.wizard_id.order_id.session_id.payment_method_ids
            )

    # View Section
    @api.model
    def default_get(self, fields):
        res = super().default_get(fields)
        if "new_line_ids" not in self._context:
            return res
        balance = self._context.get("amount_total", 0.0)
        for line in self.wizard_id.old_line_ids:
            balance -= line.get("amount")
        res.update({"amount": balance})
        return res
