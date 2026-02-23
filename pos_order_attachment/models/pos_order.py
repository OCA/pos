# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrder(models.Model):
    _name = "pos.order"
    _inherit = ["pos.order", "mail.thread"]

    attachment_ids = fields.One2many(
        "ir.attachment",
        compute="_compute_attachment_ids",
        string="Main_Attachments",
        help="Attachment that don't come from message.",
    )
    doc_count = fields.Integer(
        compute="_compute_attached_docs_count",
        string="Number of documents attached",
        store=True,
    )

    def _compute_attachment_ids(self):
        for order in self:
            attachment_ids = (
                self.env["ir.attachment"]
                .search([("res_model", "=", "pos.order"), ("res_id", "=", order.id)])
                .ids
            )
            message_attachment_ids = order.mapped("message_ids.attachment_ids").ids
            order.attachment_ids = [
                (6, 0, list(set(attachment_ids) - set(message_attachment_ids)))
            ]

    def _compute_attached_docs_count(self):
        Document = self.env["ir.attachment"]
        for order in self:
            order.doc_count = Document.search_count(
                [
                    ("res_model", "=", "pos.order"),
                    ("res_id", "=", order.id),
                ]
            )

    def attachment_tree_view(self):
        action = self.env["ir.actions.act_window"]._for_xml_id("base.action_attachment")
        action["domain"] = str(
            [
                ("res_model", "=", "pos.order"),
                ("res_id", "in", self.ids),
            ]
        )
        action["context"] = "{'default_res_model': '%s','default_res_id': %d}" % (
            self._name,
            self.id,
        )
        return action

    @api.model_create_multi
    def create(self, vals_list):
        # We want to avoid to subscribe automatically on creation
        return super(PosOrder, self.with_context(mail_create_nosubscribe=True)).create(
            vals_list
        )

    def _export_for_ui(self, order):
        result = super()._export_for_ui(order)
        result["message_attachment_count"] = order.message_attachment_count
        return result

    def pos_attachments(self):
        self.ensure_one()
        return self._get_mail_thread_data_attachments()._attachment_format()
