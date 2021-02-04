# Copyright 2018 GRAP - Sylvain LE GAL
# Copyright 2018 Tecnativa S.L. - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    returned_order_id = fields.Many2one(
        comodel_name="pos.order", string="Returned Order", readonly=True,
    )

    returned_order_reference = fields.Char(
        related="returned_order_id.pos_reference",
        string="Reference of the returned Order",
    )

    refund_order_ids = fields.One2many(
        comodel_name="pos.order",
        inverse_name="returned_order_id",
        string="Refund Orders",
        readonly=True,
    )

    refund_order_qty = fields.Integer(
        compute="_compute_refund_order_qty", string="Refund Orders Quantity",
    )

    @api.depends("refund_order_ids")
    def _compute_refund_order_qty(self):
        for order in self:
            order.refund_order_qty = len(order.refund_order_ids)

    def action_view_refund_orders(self):
        self.ensure_one()

        action = self.env.ref("point_of_sale.action_pos_pos_form").read()[0]

        if self.refund_order_qty == 1:
            action["views"] = [
                (self.env.ref("point_of_sale.view_pos_pos_form").id, "form")
            ]
            action["res_id"] = self.refund_order_ids.ids[0]
        else:
            action["domain"] = [("id", "in", self.refund_order_ids.ids)]
        return action

    def refund(self):
        return super(PosOrder, self.with_context(refund=True)).refund()

    @api.returns("self", lambda value: value.id)
    def copy(self, default=None):
        self.ensure_one()
        order = super().copy(default=default)
        if self.env.context.get("refund", False):
            order.returned_order_id = self.id
        return order

    @api.model
    def _prepare_filter_for_pos(self, pos_session_id):
        return [
            ("state", "in", ["paid", "done", "invoiced"]),
        ]

    @api.model
    def _prepare_filter_query_for_pos(self, pos_session_id, query):
        return [
            "|",
            "|",
            ("name", "ilike", query),
            ("pos_reference", "ilike", query),
            ("partner_id.display_name", "ilike", query),
        ]

    @api.model
    def _prepare_fields_for_pos_list(self):
        return [
            "name",
            "pos_reference",
            "partner_id",
            "date_order",
            "amount_total",
        ]

    @api.model
    def search_done_orders_for_pos(self, query, pos_session_id):
        session_obj = self.env["pos.session"]
        config = session_obj.browse(pos_session_id).config_id
        condition = self._prepare_filter_for_pos(pos_session_id)
        if not query:
            # Search only this POS orders
            condition += [("config_id", "=", config.id)]
        else:
            # Search globally by criteria
            condition += self._prepare_filter_query_for_pos(pos_session_id, query)
        field_names = self._prepare_fields_for_pos_list()
        return self.search_read(
            condition, field_names, limit=config.iface_load_done_order_max_qty
        )

    def _prepare_done_order_for_pos(self):
        self.ensure_one()
        order_lines = []
        payment_lines = []
        for order_line in self.lines:
            order_line = self._prepare_done_order_line_for_pos(order_line)
            order_lines.append(order_line)
        for payment_line in self.payment_ids:
            payment_line = self._prepare_done_order_payment_for_pos(payment_line)
            payment_lines.append(payment_line)
        res = {
            "id": self.id,
            "date_order": self.date_order,
            "pos_reference": self.pos_reference,
            "name": self.name,
            "partner_id": self.partner_id.id,
            "fiscal_position": self.fiscal_position_id.id,
            "line_ids": order_lines,
            "statement_ids": payment_lines,
            "to_invoice": bool(self.to_invoice),
            "returned_order_id": self.returned_order_id.id,
            "returned_order_reference": self.returned_order_reference,
        }
        return res

    def _prepare_done_order_line_for_pos(self, order_line):
        self.ensure_one()
        return {
            "product_id": order_line.product_id.id,
            "qty": order_line.qty,
            "price_unit": order_line.price_unit,
            "discount": order_line.discount,
            "pack_lot_names": order_line.pack_lot_ids.mapped("lot_name"),
        }

    def _prepare_done_order_payment_for_pos(self, payment_line):
        self.ensure_one()
        return {
            "journal_id": payment_line.pos_order_id.sale_journal,
            "amount": payment_line.amount,
        }

    def load_done_order_for_pos(self):
        self.ensure_one()
        return self._prepare_done_order_for_pos()

    @api.model
    def _order_fields(self, ui_order):
        res = super()._order_fields(ui_order)
        res.update({"returned_order_id": ui_order.get("returned_order_id", False)})
        return res
