# Copyright (C) 2015-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import UserError


class PosPaymentChangeWizard(models.TransientModel):
    _name = "pos.payment.change.wizard"
    _description = "PoS Payment Change Wizard"

    # Column Section
    order_id = fields.Many2one(comodel_name="pos.order", string="Order", readonly=True)

    old_line_ids = fields.One2many(
        comodel_name="pos.payment.change.wizard.old.line",
        inverse_name="wizard_id",
        string="Old Payment Lines",
        readonly=True,
    )

    new_line_ids = fields.One2many(
        comodel_name="pos.payment.change.wizard.new.line",
        inverse_name="wizard_id",
        string="New Payment Lines",
    )

    amount_total = fields.Float(string="Total", readonly=True)

    # View Section
    @api.model
    def default_get(self, fields):
        PosOrder = self.env["pos.order"]
        res = super().default_get(fields)
        order = PosOrder.browse(self._context.get("active_id"))
        old_lines_vals = []
        for payment in order.payment_ids:
            old_lines_vals.append(
                (
                    0,
                    0,
                    {
                        "old_payment_method_id": payment.payment_method_id.id,
                        "amount": payment.amount,
                    },
                )
            )
        res.update(
            {
                "order_id": order.id,
                "amount_total": order.amount_total,
                "old_line_ids": old_lines_vals,
            }
        )
        return res

    # View section
    def button_change_payment(self):
        self.ensure_one()
        order = self.order_id

        # Check if the total is correct
        total = sum(self.mapped("new_line_ids.amount"))
        if total != self.amount_total:
            raise UserError(
                _(
                    "Differences between the two values for the POS"
                    " Order '%s':\n\n"
                    " * Total of all the new payments %s;\n"
                    " * Total of the POS Order %s;\n\n"
                    "Please change the payments."
                    % (order.name, total, order.amount_total)
                )
            )

        # Change payment
        new_payments = [
            {
                "pos_order_id": order.id,
                "payment_method_id": line.new_payment_method_id.id,
                "amount": line.amount,
                "payment_date": fields.Date.context_today(self),
            }
            for line in self.new_line_ids
        ]

        orders = order.change_payment(new_payments)

        # Note. Because of the poor design of the closing session process
        # in Odoo, we call _check_pos_session_balance() that sets
        # balance_end_real with balance_end for "non cash" journals
        if order.session_id.state == "closing_control":
            order.session_id._check_pos_session_balance()

        if len(orders) == 1:
            # if policy is 'update', only close the pop up
            action = {"type": "ir.actions.act_window_close"}
        else:
            # otherwise (refund policy), displays the 3 orders
            action = self.env["ir.actions.act_window"]._for_xml_id(
                "point_of_sale.action_pos_pos_form"
            )
            action["domain"] = [("id", "in", orders.ids)]

        return action
