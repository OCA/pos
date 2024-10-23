# Copyright 2023 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import pytz

from odoo import _, fields, models
from odoo.exceptions import UserError


class PosOrder(models.Model):
    _inherit = "pos.order"

    splitting_partner_id = fields.Many2one("res.partner", readonly=True)
    splitting_move_id = fields.Many2one("account.move", readonly=True)

    def _process_saved_order(self, draft):
        self.splitting_partner_id = (
            any(line.split_invoice_amount for line in self.lines)
            and self.pricelist_id.split_invoice_partner_id
        )
        result = super()._process_saved_order(draft)
        if not draft and self.splitting_partner_id and not self.splitting_move_id:
            if not self.partner_id:
                raise UserError(_("Partner is required when splitting an order"))
            self.splitting_move_id = self.with_company(
                self.company_id.id
            )._create_splitting_invoice(
                self.with_company(self.company_id.id)._prepare_splitting_invoice_vals()
            )
        return result

    def _create_splitting_invoice(self, move_vals):
        self.ensure_one()
        new_move = (
            self.env["account.move"]
            .sudo()
            .with_company(self.company_id)
            .with_context(default_move_type=move_vals["move_type"])
            .create(move_vals)
        )
        message = _(
            "This invoice has been created from the point of sale session: %s",
            self._get_html_link(),
        )
        new_move.message_post(body=message)
        if new_move.auto_post == "no":
            new_move.action_post()
        return new_move

    def _prepare_splitting_invoice_vals(self):
        self.ensure_one()
        timezone = pytz.timezone(self._context.get("tz") or self.env.user.tz or "UTC")
        invoice_date = (
            fields.Datetime.now()
            if self.session_id.state == "closed"
            else self.date_order
        )
        pos_refunded_invoice_ids = []
        for orderline in self.lines:
            if (
                orderline.refunded_orderline_id
                and orderline.refunded_orderline_id.order_id.splitting_move_id
            ):
                pos_refunded_invoice_ids.append(
                    orderline.refunded_orderline_id.order_id.splitting_move_id.id
                )
        vals = {
            "invoice_origin": self.name,
            "pos_refunded_invoice_ids": pos_refunded_invoice_ids,
            "journal_id": self.session_id.config_id.invoice_journal_id.id,
            "move_type": "out_invoice" if self.amount_total >= 0 else "out_refund",
            "ref": self.name,
            "partner_id": self.splitting_partner_id.id,
            "partner_bank_id": self._get_splitting_partner_bank_id(),
            "currency_id": self.currency_id.id,
            "invoice_user_id": self.user_id.id,
            "invoice_date": invoice_date.astimezone(timezone).date(),
            "fiscal_position_id": self.splitting_partner_id.property_account_position_id.id,
            "invoice_line_ids": self._prepare_splitting_invoice_lines(),
            "invoice_payment_term_id": self.splitting_partner_id.property_payment_term_id.id
            or False,
            "splitting_partner_id": self.partner_id.id,
            "splitting_order_id": self.id,
        }
        if self.refunded_order_ids.splitting_move_id:
            vals["ref"] = _(
                "Reversal of: %s", self.refunded_order_ids.splitting_move_id.name
            )
            vals["reversed_entry_id"] = self.refunded_order_ids.splitting_move_id.id
        if self.note:
            vals.update({"narration": self.note})
        return vals

    def _get_splitting_partner_bank_id(self):
        bank_partner_id = False
        if self.amount_total <= 0 and self.splitting_partner_id.bank_ids:
            bank_partner_id = self.splitting_partner_id.bank_ids[0].id
        elif self.amount_total >= 0 and self.company_id.partner_id.bank_ids:
            bank_partner_id = self.company_id.partner_id.bank_ids[0].id
        return bank_partner_id

    def _prepare_splitting_invoice_lines(self):
        """Prepare a list of orm commands containing the dictionaries to fill the
        'invoice_line_ids' field when creating an invoice.

        :return: A list of Command.create to fill 'invoice_line_ids' when calling account.move.create.
        """
        sign = 1 if self.amount_total >= 0 else -1
        line_values_list = self._prepare_tax_base_splitting_line_values(sign=sign)
        invoice_lines = []
        for line_values in line_values_list:
            invoice_lines.append(
                (
                    0,
                    None,
                    {
                        "product_id": line_values["product"].id,
                        "quantity": line_values["quantity"],
                        "price_unit": line_values["price_unit"],
                        "name": line_values["name"],
                        "tax_ids": [(6, 0, line_values["taxes"].ids)],
                        "product_uom_id": line_values["uom"].id,
                    },
                )
            )

        return invoice_lines

    def _prepare_tax_base_splitting_line_values(self, sign=1):
        """Convert pos order lines into dictionaries that would be used to compute taxes later.

        :param sign: An optional parameter to force the sign of amounts.
        :return: A list of python dictionaries (see '_convert_to_tax_base_line_dict' in account.tax).
        """
        self.ensure_one()
        commercial_partner = self.splitting_partner_id.commercial_partner_id

        base_line_vals_list = []
        for line in self.lines.with_company(self.company_id).filtered(
            lambda r: r.split_invoice_amount
        ):
            account = line.product_id._get_product_accounts()["income"]
            if not account:
                raise UserError(
                    _(
                        "Please define income account for this product: '%s' (id:%d).",
                        line.product_id.name,
                        line.product_id.id,
                    )
                )

            if self.splitting_partner_id.property_account_position_id:
                account = (
                    self.splitting_partner_id.property_account_position_id.map_account(
                        account
                    )
                )

            is_refund = line.qty * line.split_invoice_amount < 0

            product_name = line.product_id.with_context(
                lang=self.splitting_partner_id.lang or self.env.user.lang
            ).get_product_multiline_description_sale()
            base_line_vals_list.append(
                {
                    **self.env["account.tax"]._convert_to_tax_base_line_dict(
                        line,
                        partner=commercial_partner,
                        currency=self.currency_id,
                        product=line.product_id,
                        taxes=line.tax_ids_after_fiscal_position,
                        price_unit=line.split_invoice_amount,
                        quantity=sign * line.qty,
                        price_subtotal=sign * line.split_invoice_amount * line.qty,
                        discount=line.discount,
                        account=account,
                        is_refund=is_refund,
                    ),
                    "uom": line.product_uom_id,
                    "name": product_name,
                }
            )
        return base_line_vals_list
