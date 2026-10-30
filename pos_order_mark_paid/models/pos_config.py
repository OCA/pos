# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosConfig(models.Model):
    _inherit = "pos.config"

    mark_paid_enabled = fields.Boolean(
        string="Mark as Paid",
        help="Allow cashiers to settle a cash order paid slightly short "
        "and write off the residual",
    )
    mark_paid_account_id = fields.Many2one(
        "account.account",
        string="Write-off Account",
        # Same account types as an invoice line accepts
        # (account/views/account_move_views.xml:1038).
        domain="[('deprecated', '=', False), ('account_type', 'not in', "
        "('asset_receivable', 'liability_payable', 'off_balance'))]",
        check_company=True,
        help="Account that receives the written-off residual amounts.",
    )
    mark_paid_max_percent = fields.Float(
        string="Max Write-off (%)",
        help="Maximum write-off, in percent of the order total including taxes. "
        "0 means no limit.",
    )
    mark_paid_max_amount = fields.Monetary(
        string="Max Write-off Amount",
        currency_field="currency_id",
        help="Maximum write-off amount. 0 means no limit.",
    )
    mark_paid_label = fields.Char(
        string="Receipt Label",
        help="Label of the write-off line on the receipt and on the invoice, "
        "e.g. 'Extra discount'.",
    )

    @api.constrains(
        "mark_paid_enabled",
        "mark_paid_account_id",
        "mark_paid_max_percent",
        "mark_paid_max_amount",
        "mark_paid_label",
    )
    def _check_mark_paid_settings(self):
        """Validate the Mark as Paid settings of the enabled Points of Sale.

        A write-off needs an account to be booked on and a label to be printed,
        and at least one limit, so that a cashier cannot write off any amount.

        :raises ValidationError: if a setting of an enabled Point of Sale is
            missing or out of range.
        """
        for config in self.filtered("mark_paid_enabled"):
            if not config.mark_paid_account_id:
                raise ValidationError(
                    _(
                        "Set a Write-off Account to use Mark as Paid "
                        "in the Point of Sale %(pos)s.",
                        pos=config.name,
                    )
                )
            # The account goes on invoice lines, where account refuses these
            # types (account/models/account_move_line.py:1324-1341).
            if config.mark_paid_account_id.account_type in (
                "asset_receivable",
                "liability_payable",
                "off_balance",
            ):
                raise ValidationError(
                    _(
                        "The Write-off Account of the Point of Sale %(pos)s "
                        "cannot be a receivable, payable or off-balance account.",
                        pos=config.name,
                    )
                )
            if not config.mark_paid_label:
                raise ValidationError(
                    _(
                        "Set a Receipt Label to use Mark as Paid "
                        "in the Point of Sale %(pos)s.",
                        pos=config.name,
                    )
                )
            if not 0 <= config.mark_paid_max_percent <= 100:
                raise ValidationError(
                    _(
                        "Max Write-off (%%) must be between 0 and 100 "
                        "in the Point of Sale %(pos)s.",
                        pos=config.name,
                    )
                )
            if config.mark_paid_max_amount < 0:
                raise ValidationError(
                    _(
                        "Max Write-off Amount cannot be negative "
                        "in the Point of Sale %(pos)s.",
                        pos=config.name,
                    )
                )
            if not config.mark_paid_max_percent and not config.mark_paid_max_amount:
                raise ValidationError(
                    _(
                        "Set Max Write-off (%%) or Max Write-off Amount "
                        "to use Mark as Paid in the Point of Sale %(pos)s.",
                        pos=config.name,
                    )
                )

    def _get_forbidden_change_fields(self):
        """Lock the Mark as Paid settings while a session is open.

        The limits checked by the server, the account booked at closing and the
        label printed on invoices must stay the same for the whole session.

        :return: names of the fields that cannot change while a session is open
        :rtype: list
        """
        return super()._get_forbidden_change_fields() + [
            "mark_paid_enabled",
            "mark_paid_account_id",
            "mark_paid_max_percent",
            "mark_paid_max_amount",
            "mark_paid_label",
        ]
