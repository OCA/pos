# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class PosOrder(models.Model):
    _name = "pos.order"
    _inherit = ["pos.order", "mail.thread"]

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
