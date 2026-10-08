# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.fr/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: La Louve
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html

import logging

import odoo
from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    email_status = fields.Selection(
        [("no_send", "Do not Send"), ("to_send", "To send"), ("sent", "Sent")],
        default="no_send",
        copy=False,
        string="Send Status",
    )

    @api.model
    def _send_order_cron(self):
        _logger.info("------------------------------------------------------")
        mail_template = self.env.ref(
            "pos_ticket_send_by_mail.email_send_pos_receipt",
            raise_if_not_found=False,
        )
        if not mail_template.exists():
            _logger.warning("No mail template found for sending ticket")
            return
        _logger.info("Start to send ticket")
        for order in self.search([("email_status", "=", "to_send")]):
            mail_template.send_mail(order.id, force_send=True)
            order.email_status = "sent"
            # Make sure we commit the change to not send ticket twice
            if not odoo.tools.config["test_enable"]:
                self.env.cr.commit()  # pylint: disable=E8102

    def action_pos_order_paid(self):
        # Send e-receipt for the partner.
        # It depends on value of the field `receipt_option`
        # that we config in pos.config.settings
        #  receipt_option = 1: Don't send e-receipt
        #  receipt_option = 2 or 3: Send e-receipt
        res = super().action_pos_order_paid()
        self._set_order_to_send()
        return res

    def _set_order_to_send(self):
        receipt_options = self.config_id.receipt_options
        receipt_options = receipt_options and int(receipt_options) or False
        for order in self:
            if (
                receipt_options in [2, 3, 4]
                and order.partner_id.email
                and order.partner_id.pos_email_receipt != "no_email_pos_receipt"
            ):
                order.email_status = "to_send"

    def _get_statments(self):
        self.ensure_one()
        acc_move_lines = self.account_move.line_ids
        return acc_move_lines.mapped("statement_id")
