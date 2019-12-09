# Copyright 2019 Coop IT Easy SCRLfs
# @author Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).


import logging
import base64
from odoo import fields, models, api, _


_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    email_receipt_sent = fields.Boolean(readonly=True)

    @api.model
    def send_mail_receipt(
        self, pos_reference, email, body_from_ui, force=True
    ):
        order = self.search([("pos_reference", "=", pos_reference)])
        if len(order) < 1:
            _logger.error(_("Error: no order found"))
            return
        if order.email_receipt_sent:
            _logger.info(_("E-mail already sent"))
            return
        if not email and not order.partner_id and not order.partner_id.email:
            _logger.error(
                _(
                    "Cannot send the ticket, "
                    "no email address found for the client"
                )
            )
        email_values = {}
        if email:
            email_values["email_to"] = email
        else:
            email_values["email_to"] = order.partner_id.email

        receipt = (
            "<main><div class='article'><div class='pos'>"
            "<div class='pos-receipt-container'>"
            "{}</div></div></div></main>".format(body_from_ui)
        )

        bodies, html_ids, header, footer, specific_paperformat_args = self.env[
            "ir.actions.report"
        ]._prepare_html(receipt)
        base64_pdf = self.env["ir.actions.report"]._run_wkhtmltopdf(
            bodies,
            landscape=False,
            specific_paperformat_args=specific_paperformat_args,
        )
        attachment = self.env["ir.attachment"].create(
            {
                "name": pos_reference,
                "datas_fname": _("Receipt_{}.pdf".format(pos_reference)),
                "type": "binary",
                "mimetype": "application/x-pdf",
                "db_datas": base64.encodestring(base64_pdf),
                "res_model": "pos.order",
                "res_id": order.id,
            }
        )
        email_values["attachment_ids"] = [attachment.id]
        mail_template = self.env.ref("pos_mail_receipt.email_send_ticket")
        mail_template.send_mail(
            order.id, force_send=force, email_values=email_values,
        )
        order.email_receipt_sent = True

    @api.model
    def create_from_ui(self, orders):
        res = super(PosOrder, self).create_from_ui(orders)
        for order in orders:
            if "email" in order["data"]:
                self.send_mail_receipt(
                    order["data"]["name"],
                    order["data"]["email"],
                    order["data"]["body_from_ui"],
                    force=False,
                )
        return res
