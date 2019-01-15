# -*- coding: utf-8 -*-
# © 2018 Akretion
# @author Mourad EL HADJ MIMOUNE <mourad.elhadj.mimoune@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class AccountInvoice(models.Model):
    _inherit = "account.invoice"

    pos_anonyme_invoice = fields.Boolean()
    session_id = fields.Many2one(
        'pos.session', string='Session', index=1,
        domain="[('state', '=', 'opened')]",
        states={'draft': [('readonly', False)]},
    )

    @api.multi
    def invoice_validate(self):
        # Update invoice partner on sale order and update partner on
        # sale order statement if different on the invoice.
        # In order not to have inconsistency on the partners when the reconcile
        for invoice in self:
            sales = []
            for invoice_line in invoice.invoice_line_ids:
                for sale_line in invoice_line.sale_line_ids:
                    if sale_line.order_id not in sales:
                        sales += sale_line.order_id
            for sale in sales:
                if (invoice.pos_anonyme_invoice and
                    invoice.session_id == sale.session_id and
                        sale.partner_invoice_id != invoice.partner_id):
                    sale.write({'partner_id': invoice.partner_id.id,
                                'partner_invoice_id': invoice.partner_id.id})
                    sale.statement_ids.write(
                        {'partner_id': invoice.partner_id.id})
        return super(AccountInvoice, self).invoice_validate()
