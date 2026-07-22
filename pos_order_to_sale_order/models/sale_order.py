# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import Command, api, fields, models
from odoo.exceptions import UserError

_POS_ACTION_CONFIG = {
    "draft": "iface_create_draft_sale_order",
    "confirmed": "iface_create_confirmed_sale_order",
    "delivered": "iface_create_delivered_sale_order",
    "invoiced": "iface_create_invoiced_sale_order",
}


class SaleOrder(models.Model):
    _inherit = "sale.order"

    pos_session_id = fields.Many2one(
        comodel_name="pos.session",
        string="Pos Session",
        readonly=True,
    )

    @api.model
    def _get_create_line_vals_from_pos(self, order_data):
        """Return vals dicts for POS order lines marked as create commands only."""
        return [
            line_data[2]
            for line_data in order_data.get("lines") or []
            if (
                isinstance(line_data, (list, tuple))
                and len(line_data) >= 3
                and line_data[0] == Command.CREATE
                and isinstance(line_data[2], dict)
            )
        ]

    @api.model
    def _get_pos_session_for_order_creation(self, order_data):
        session = self.env["pos.session"].search(
            [("id", "=", order_data.get("session_id"))], limit=1
        )
        if not session:
            raise UserError(self.env._("No accessible POS session found."))
        if session.state not in ("opened", "opening_control"):
            raise UserError(
                self.env._(
                    "The POS session %(session)s is not open.",
                    session=session.display_name,
                )
            )
        return session

    @api.model
    def _check_pos_create_action_allowed(self, session, action):
        config_field = _POS_ACTION_CONFIG.get(action)
        if not config_field or not session.config_id[config_field]:
            raise UserError(
                self.env._(
                    "Creating a %(action)s sale order from this POS is not allowed.",
                    action=action,
                )
            )

    @api.model
    def _prepare_from_pos(self, order_data, line_vals_list):
        session = self.env["pos.session"].browse(order_data["session_id"])
        SaleOrderLine = self.env["sale.order.line"]
        order_lines = [
            Command.create(SaleOrderLine._prepare_from_pos(sequence, line_vals))
            for sequence, line_vals in enumerate(line_vals_list, start=1)
        ]
        return {
            "partner_id": order_data["partner_id"],
            "pos_session_id": session.id,
            "origin": self.env._("Point of Sale %s", session.name),
            "client_order_ref": order_data["name"],
            "user_id": order_data.get("user_id") or self.env.user.id,
            "pricelist_id": order_data["pricelist_id"],
            "fiscal_position_id": order_data["fiscal_position_id"],
            "order_line": order_lines,
        }

    @api.model
    def create_order_from_pos(self, order_data, action):
        if not order_data.get("partner_id"):
            raise UserError(self.env._("A customer is required to create a sale order."))

        # Validate session/config with the caller's ACLs before elevating.
        session = self._get_pos_session_for_order_creation(order_data)
        self._check_pos_create_action_allowed(session, action)
        line_vals_list = self._get_create_line_vals_from_pos(order_data)
        if not line_vals_list:
            raise UserError(self.env._("No order lines to create a sale order from."))

        # POS cashiers may not have Sales ACLs.
        self = self.sudo()
        order_vals = self._prepare_from_pos(order_data, line_vals_list)
        sale_order = self.with_context(pos_order_lines_data=line_vals_list).create(
            order_vals
        )
        sale_order._recompute_taxes()

        # Confirm Sale Order
        if action in ["confirmed", "delivered", "invoiced"]:
            sale_order.action_confirm()

        # mark picking as delivered
        if action in ["delivered", "invoiced"]:
            # Mark all moves are delivered
            for move in sale_order.mapped("picking_ids.move_ids"):
                move.quantity = move.product_uom_qty
            sale_order.mapped("picking_ids").button_validate()

        if action in ["invoiced"]:
            # Create and confirm invoices
            invoices = sale_order._create_invoices()
            invoices.action_post()

        return {
            "sale_order_id": sale_order.id,
        }
