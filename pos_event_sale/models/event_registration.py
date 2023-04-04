# Copyright 2021 Camptocamp (https://www.camptocamp.com).
# @author Iván Todorovich <ivan.todorovich@camptocamp.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.tools import float_is_zero


class EventRegistration(models.Model):
    _inherit = "event.registration"

    pos_order_line_id = fields.Many2one(
        comodel_name="pos.order.line",
        string="POS Order Line",
        ondelete="cascade",
        readonly=True,
        copy=False,
    )
    pos_order_id = fields.Many2one(
        comodel_name="pos.order",
        string="POS Order",
        related="pos_order_line_id.order_id",
        store=True,
        ondelete="cascade",
        copy=False,
    )
    pos_config_id = fields.Many2one(
        comodel_name="pos.config",
        string="Point of Sale",
        related="pos_order_id.config_id",
    )

    @api.depends("pos_order_line_id.currency_id", "pos_order_line_id.price_subtotal")
    def _compute_payment_status(self):
        # Override to compute it for registrations created from PoS orders.
        # The original method only considers Sales Orders.
        res = super()._compute_payment_status()
        for rec in self:
            if not rec.pos_order_line_id:
                continue
            if float_is_zero(
                rec.pos_order_line_id.price_subtotal,
                precision_digits=rec.pos_order_line_id.currency_id.rounding,
            ):
                rec.payment_status = "free"
            elif rec.is_paid:
                rec.payment_status = "paid"
            else:
                rec.payment_status = "not_paid"
        return res

    def _check_auto_confirmation(self):
        # OVERRIDE to disable auto confirmation for registrations created from
        # PoS orders. We confirm them explicitly when the orders are paid.
        if any(rec.pos_order_line_id for rec in self):
            return False
        return super()._check_auto_confirmation()

    @api.model_create_multi
    def create(self, vals_list):
        # Override to post the origin-link message.
        # There's a similar implementation for Sales Orders in module `event_sale`.
        records = super().create(vals_list)
        for rec in records.filtered("pos_order_id"):
            rec.message_post_with_view(
                "mail.message_origin_link",
                values={"self": rec, "origin": rec.pos_order_id.session_id},
                subtype_id=self.env.ref("mail.mt_note").id,
            )
        return records

    def action_view_pos_order(self):
        action = self.env["ir.actions.actions"]._for_xml_id(
            "point_of_sale.action_pos_pos_form"
        )
        action["views"] = [(False, "form")]
        action["res_id"] = self.pos_order_id.id
        return action
