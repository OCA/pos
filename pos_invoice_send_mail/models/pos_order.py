# Copyright 2019 Druidoo - Iván Todorovich
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def create_from_ui(self, orders):
        """ Inherit method to send by email """
        order_ids = super().create_from_ui(orders)
        refs_to_send_mail = [
            o['data']['name'] for o in orders
            if o['data'].get('to_send_mail')
        ]
        # Identify orders to send email
        for order in self.browse(order_ids):
            if (
                order.config_id.iface_invoice_mail
                and order.invoice_id
                and not order.invoice_id.sent
                and order.pos_reference in refs_to_send_mail
            ):
                invoice_id = order.invoice_id.with_context(
                    mark_invoice_as_sent=True)
                invoice_id.message_post_with_template(
                    order.config_id.invoice_mail_template_id.id)
        return order_ids
