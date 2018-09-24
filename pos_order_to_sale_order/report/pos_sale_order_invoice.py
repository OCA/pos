# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, models, _
from odoo.exceptions import UserError


class SoInvoiceReport(models.AbstractModel):
    _name = 'report.pos_order_to_sale_order.report_so_invoice'

    @api.model
    def render_html(self, docids, data=None):
        Report = self.env['report']
        SO = self.env['sale.order']
        ids_to_print = []
        invoiced_Saleorders_ids = []
        selected_orders = SO.browse(docids)
        for order in selected_orders.filtered(lambda o: o.invoice_ids):
            for invoice_id in order.invoice_ids:
                ids_to_print.append(invoice_id.id)
            invoiced_Saleorders_ids.append(order.id)
        not_invoiced_orders_ids = list(
            set(docids) - set(invoiced_Saleorders_ids))
        if not_invoiced_orders_ids:
            not_invoiced_posorders = SO.browse(not_invoiced_orders_ids)
            not_invoiced_orders_names = list(
                map(lambda a: a.name, not_invoiced_posorders))
            raise UserError(_('No link to an invoice for %s.') %
                            ', '.join(not_invoiced_orders_names))

        return Report.sudo().render(
            'account.report_invoice',
            {'docs': self.env['account.invoice'].sudo().browse(ids_to_print)})
