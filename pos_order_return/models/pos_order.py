# Copyright 2016-2018 Sylvain LE GAL (https://twitter.com/legalsylvain)
# Copyright 2018 David Vidal <david.vidal@tecnativa.com>
# Copyright 2018 Lambda IS DOOEL <https://www.lambda-is.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from odoo.tests import Form


class PosOrder(models.Model):
    _inherit = "pos.order"

    returned_order_id = fields.Many2one(
        comodel_name="pos.order",
        string="Returned Order",
        readonly=True,
    )
    refund_order_ids = fields.One2many(
        comodel_name="pos.order",
        inverse_name="returned_order_id",
        string="Refund Orders",
        readonly=True,
    )
    refund_order_qty = fields.Integer(
        compute="_compute_refund_order_qty",
        string="Refund Orders Quantity",
    )

    def _compute_refund_order_qty(self):
        order_data = self.env["pos.order"].read_group(
            [("returned_order_id", "in", self.ids)],
            ["returned_order_id"],
            ["returned_order_id"],
        )
        mapped_data = {
            order["returned_order_id"][0]: order["returned_order_id_count"]
            for order in order_data
        }
        for order in self:
            order.refund_order_qty = mapped_data.get(order.id, 0)

    def _blank_refund(self, res):
        self.ensure_one()
        new_order = self.browse(res["res_id"])
        new_order.returned_order_id = self
        # Remove created lines and recreate and link Lines
        new_order.lines.unlink()
        return new_order

    def _prepare_invoice_vals(self):
        res = super()._prepare_invoice_vals()
        if not self.returned_order_id.account_move:
            return res
        res.update(
            {
                "invoice_origin": self.returned_order_id.account_move.name,
                "name": _("Return of %s" % self.returned_order_id.account_move.name),
                "reversed_entry_id": self.returned_order_id.account_move.id,
            }
        )
        return res

    def _action_pos_order_invoice(self):
        """Wrap common process"""
        self.action_pos_order_invoice()
        self.action_view_invoice()

    def refund(self):
        # Call super to use original refund algorithm (session management, ...)
        ctx = dict(self.env.context, do_not_check_negative_qty=True)
        res = super(PosOrder, self.with_context(ctx)).refund()
        new_order = self._blank_refund(res)
        for line in self.lines:
            qty = -line.max_returnable_qty([])
            if qty != 0:
                copy_line = line.copy(
                    {
                        "order_id": new_order.id,
                        "returned_line_id": line.id,
                        "qty": qty,
                    }
                )
                copy_line._onchange_amount_line_all()
        new_order._onchange_amount_all()
        return res

    def partial_refund(self, partial_return_wizard):
        ctx = dict(self.env.context, partial_refund=True)
        res = self.with_context(ctx).refund()
        new_order = self._blank_refund(res)
        for wizard_line in partial_return_wizard.line_ids:
            qty = -wizard_line.qty
            if qty != 0:
                copy_line = wizard_line.pos_order_line_id.copy(
                    {
                        "order_id": new_order.id,
                        "returned_line_id": wizard_line.pos_order_line_id.id,
                        "qty": qty,
                    }
                )
                copy_line._onchange_amount_line_all()
        new_order._onchange_amount_all()
        return res

    def action_pos_order_paid(self):
        res = super().action_pos_order_paid()
        if self.returned_order_id and self.returned_order_id.account_move:
            self._action_pos_order_invoice()
        return res

    def _get_picking_destination(self):
        picking_type = self.config_id.picking_type_id
        if self.partner_id.property_stock_customer:
            destination = self.partner_id.property_stock_customer
        elif not picking_type or not picking_type.default_location_dest_id:
            destination = self.env["stock.warehouse"]._get_partner_locations()[0]
        else:
            destination = picking_type.default_location_dest_id
        return destination

    def _create_picking_return(self):
        self.ensure_one()
        return_form = Form(
            self.env["stock.return.picking"].with_context(
                active_id=self.returned_order_id.picking_ids.filtered(
                    lambda picking: picking.location_dest_id.usage == "customer"
                ).id,
                active_model="stock.picking",
            )
        )
        wizard = return_form.save()
        # Discard not returned lines
        wizard.product_return_moves.filtered(
            lambda x: x.product_id not in self.mapped("lines.product_id")
        ).unlink()
        to_return = {}
        order_lines = self.lines
        for order_line in order_lines:
            to_return.setdefault(order_line.product_id, 0)
            if order_line.qty > 0:
                continue
            order_lines -= order_line
            to_return[order_line.product_id] += order_line.qty
        for move in wizard.product_return_moves:
            if abs(to_return[move.product_id]) < move.quantity:
                move.quantity = abs(to_return[move.product_id])
            to_return[move.product_id] -= move.quantity
        picking = self.env["stock.picking"].browse()
        # Avoid empty returns which will block the validation
        if any(wizard.product_return_moves.mapped("quantity")):
            picking = self.env["stock.picking"].browse(
                wizard.create_returns()["res_id"]
            )
        normal_picking = self.env["stock.picking"]._create_picking_from_pos_order_lines(
            self._get_picking_destination().id,
            order_lines,
            self.config_id.picking_type_id,
            self.partner_id,
        )
        for move in picking.move_lines:
            move.quantity_done = move.product_uom_qty
        picking._action_done()
        (picking | normal_picking).write(
            {
                "pos_session_id": self.session_id.id,
                "pos_order_id": self.id,
                "origin": self.name,
            }
        )
        return picking | normal_picking

    def _create_order_picking(self):
        """Odoo bases return picking if the quantities are negative, but it's
        not linked to the original one"""
        self.ensure_one()
        if not self.returned_order_id.picking_ids:
            return super()._create_order_picking()
        self.picking_ids = self._create_picking_return()


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    returned_line_id = fields.Many2one(
        comodel_name="pos.order.line",
        string="Returned Order",
        readonly=True,
    )
    refund_line_ids = fields.One2many(
        comodel_name="pos.order.line",
        inverse_name="returned_line_id",
        string="Refund Lines",
        readonly=True,
    )

    @api.model
    def max_returnable_qty(self, ignored_line_ids):
        qty = self.qty
        for refund_line in self.refund_line_ids:
            if refund_line.id not in ignored_line_ids:
                qty += refund_line.qty
        return qty

    @api.constrains("returned_line_id", "qty")
    def _check_return_qty(self):
        if self.env.context.get("do_not_check_negative_qty", False):
            return True
        for line in self:
            if line.returned_line_id and -line.qty > line.returned_line_id.qty:
                raise ValidationError(
                    _(
                        "You can not return %d %s of %s because the original "
                        "Order line only mentions %d %s."
                    )
                    % (
                        -line.qty,
                        line.product_id.uom_id.name,
                        line.product_id.name,
                        line.returned_line_id.qty,
                        line.product_id.uom_id.name,
                    )
                )
            if (
                line.returned_line_id
                and -line.qty > line.returned_line_id.max_returnable_qty([line.id])
            ):
                raise ValidationError(
                    _(
                        "You can not return %d %s of %s because some refunds"
                        " have already been done.\n Maximum quantity allowed :"
                        " %d %s."
                    )
                    % (
                        -line.qty,
                        line.product_id.uom_id.name,
                        line.product_id.name,
                        line.returned_line_id.max_returnable_qty([line.id]),
                        line.product_id.uom_id.name,
                    )
                )
            if (
                not line.returned_line_id
                and line.qty < 0
                and not line.product_id.product_tmpl_id.pos_allow_negative_qty
            ):
                raise ValidationError(
                    _(
                        "For legal and traceability reasons, you can not set a"
                        " negative quantity (%d %s of %s), without using "
                        "return wizard."
                    )
                    % (line.qty, line.product_id.uom_id.name, line.product_id.name)
                )
