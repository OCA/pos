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
        for invoice in self.filtered(lambda r: r.pos_anonyme_invoice):
            sales = invoice.filtered(
                lambda r: r.type in ['out_invoice', 'out_refund']
            ).invoice_line_ids.mapped('sale_line_ids').mapped(
                'order_id')            
            for sale in sales:
                if (invoice.session_id == sale.session_id and
                        sale.partner_invoice_id != invoice.partner_id):
                    sale.write({'partner_id': invoice.partner_id.id,
                                'partner_invoice_id': invoice.partner_id.id})
                    sale.statement_ids.write(
                        {'partner_id': invoice.partner_id.id})
            if invoice.partner_id != invoice.session_id.config_id.\
                    anonymous_partner_id:
                invoice.pos_anonyme_invoice = False
        return super(AccountInvoice, self).invoice_validate()

    @api.multi
    def reconcile_with_pos_payment(self):
        for invoice in self:
            if invoice.session_id:
                if invoice.state == 'open':
                    invoice.session_id._reconcile_invoice_with_pos_payment(
                        invoice)
                elif invoice.state == 'paid':
                    raise UserError(
                        _("Invoice is yet paid"))
                else:
                    raise UserError(
                        _("You must validate invoice before reconcile it with"
                          " pos payments"))
            else:
                raise UserError(
                    _("No pos session linked to the invoice %s") %
                    (invoice.number,))
        return True
