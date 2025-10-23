# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 David Vidal <david.vidal@tecnativa.com>
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
import logging

from odoo import api, fields, models
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
    _inherit = "pos.order"

    refund_order_ids = fields.Many2many(
        comodel_name="pos.order",
        string="Refund Orders",
        compute="_compute_refund_orders",
    )

    @api.depends("lines.refund_orderline_ids")
    def _compute_refund_orders(self):
        for order in self:
            order.refund_order_ids = order.mapped("lines.refund_orderline_ids.order_id")

    def _action_pos_order_invoice(self):
        """Wrap common process"""
        self.action_pos_order_invoice()

    def action_pos_order_paid(self):
        res = super().action_pos_order_paid()
        if self.refunded_order_id.account_move:
            # If the original order was invoiced, a refund invoice will be made.
            self._action_pos_order_invoice()
        return res

    def action_partial_refund(self):
        """
        Opens a wizard to process a partial refund of the order.
        """
        for order in self:
            current_session = order.session_id.config_id.current_session_id
            if not current_session:
                raise UserError(
                    self.env._(
                        "To return product(s), you need to open a session in the POS %s",  # noqa: E501
                        order.session_id.config_id.display_name,
                    )
                )
        action = self.env["ir.actions.actions"]._for_xml_id(
            "pos_order_return.action_pos_partial_return_wizard"
        )
        return action
