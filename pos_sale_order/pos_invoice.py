# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014-Today OpenERP SA (<http://www.openerp.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp import models, api, _
from openerp.exceptions import Warning


class PosInvoiceReport(models.AbstractModel):
    _inherit = 'report.point_of_sale.report_invoice'

    @api.multi
    def render_html(self, data):
        report_obj = self.env['report']
        posorder_obj = self.env['sale.order']
        report = report_obj._get_report_from_name('account.report_invoice')
        selected_orders = posorder_obj.browse(self.ids)

        ids_to_print = []
        invoiced_posorders_ids = []
        for order in selected_orders:
            if order.invoice_ids:
                ids_to_print.append(order.invoice_ids.id)
                invoiced_posorders_ids.append(order.id)

        not_invoiced_orders_ids = list(set() - set(invoiced_posorders_ids))
        if not_invoiced_orders_ids:
            not_invoiced_posorders = posorder_obj.browse(
                not_invoiced_orders_ids)
            not_invoiced_orders_names = list(
                map(lambda a: a.name, not_invoiced_posorders))
            raise Warning(
                _('Error!'),
                _('No link to an invoice for %s.' % ', '.
                  join(not_invoiced_orders_names)))

        docargs = {
            'doc_ids': ids_to_print,
            'doc_model': report.model,
            'docs': selected_orders,
        }
        return report_obj.render('account.report_invoice', docargs)
