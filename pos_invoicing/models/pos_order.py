# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, models
from odoo.exceptions import UserError
from odoo.tools import float_compare


class PosOrder(models.Model):
    _inherit = 'pos.order'

    def _prepare_invoice(self):
        res = super()._prepare_invoice()
        res.update({
            'pos_pending_payment': True,
        })
        return res

    @api.model
    def create_from_ui(self, orders):
        return super(
            PosOrder, self.with_context(pos_order_invoiced=True)
        ).create_from_ui(orders)

    @api.multi
    def action_pos_order_invoice(self):
        # this function is called by the create_from_ui
        # function, and in that case, invoice is then confirmed
        # but if called directly (by UI, in the back-office)
        # the confirmation is not done.
        # So we confirm the invoice in that case.
        res = super().action_pos_order_invoice()
        if not self.env.context.get("pos_order_invoiced", False):
            for order in self:
                order.invoice_id.sudo().with_context(
                    force_company=self.env.user.company_id.id,
                    pos_picking_id=order.picking_id,
                ).action_invoice_open()
                # Check if total amount are the same
                prec = order.invoice_id.currency_id.rounding
                if float_compare(
                    order.invoice_id.amount_total_signed,
                    order.amount_total,
                    precision_digits=prec
                ):
                    raise UserError(_(
                        "Unable to create an invoice from the order"
                        " %s because the amount totals are not the same."
                        " %s != %s"
                    ) % (
                        order.name,
                        order.invoice_id.amount_total_signed,
                        order.amount_total,
                    ))
                if float_compare(
                    order.invoice_id.amount_tax_signed,
                    order.amount_tax,
                    precision_digits=prec
                ):
                    raise UserError(_(
                        "Unable to create an invoice from the order"
                        " %s because the amount taxes are not the same."
                        " %s != %s"
                    ) % (
                        order.name,
                        order.invoice_id.amount_tax_signed,
                        order.amount_tax,
                    ))

                order.account_move = order.invoice_id.move_id
        return res
