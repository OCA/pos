# coding: utf-8
# Copyright (C) 2015-Today GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import _, api, fields, models
from openerp.exceptions import Warning as UserError


class PosChangePaymentsWizard(models.TransientModel):
    _name = 'pos.change.payments.wizard'

    # Column Section
    order_id = fields.Many2one(
        comodel_name='pos.order', string='Order', readonly=True)

    session_id = fields.Many2one(
        comodel_name='pos.session', string='Session', readonly=True)

    line_ids = fields.One2many(
        comodel_name='pos.change.payments.wizard.line',
        inverse_name='wizard_id', string='Payment Lines')

    amount_total = fields.Float(string='Total', readonly=True)

    # View Section
    @api.model
    def default_get(self, fields):
        order_obj = self.env['pos.order']
        res = super(PosChangePaymentsWizard, self).default_get(fields)
        order = order_obj.browse(self._context.get('active_id'))
        res.update({'order_id': order.id})
        res.update({'session_id': order.session_id.id})
        res.update({'amount_total': order.amount_total})
        return res

    # View section
    @api.multi
    def button_change_payments(self):
        self.ensure_one()
        order = self.order_id

        # Check if the total is correct
        total = 0
        for line in self.line_ids:
            total += line.amount
        if total != self.amount_total:
            raise UserError(_(
                "Differences between the two values for the POS"
                " Order '%s':\n\n"
                " * Total of all the new payments %s;\n"
                " * Total of the POS Order %s;\n\n"
                "Please change the payments." % (
                    order.name, total, order.amount_total)))

        # Check if change payments is allowed
        order._allow_change_payments()

        # Remove old statements
        order.statement_ids.with_context(change_pos_payment=True).unlink()

        # Create new payment
        for line in self.line_ids:
            order.add_payment_v8({
                'journal': line.new_journal_id.id,
                'amount': line.amount,
            })

        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }
