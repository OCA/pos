# Copyright 2018 GRAP - Sylvain LE GAL
# Copyright 2018 Tecnativa S.L. - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def _prepare_filter_for_pos(self, pos_session_id):
        return [
            ('state', 'in', ['paid', 'done', 'invoiced']),
        ]

    @api.model
    def _prepare_filter_query_for_pos(self, pos_session_id, query):
        return [
            '|',
            ('name', 'ilike', query),
            ('pos_reference', 'ilike', query),
        ]

    @api.model
    def _prepare_fields_for_pos_list(self):
        return [
            'name', 'pos_reference', 'partner_id', 'date_order',
            'amount_total',  'amount_paid', 'amount_return', 'session_id',
            'amount_tax', 'statement_ids', 'lines', 'invoice_id',
            'returned_order_id', 'fiscal_position_id'
        ]

    @api.model
    def search_done_orders_for_pos(self, query, pos_session_id):
        session_obj = self.env['pos.session']
        config = session_obj.browse(pos_session_id).config_id
        condition = self._prepare_filter_for_pos(pos_session_id)
        if not query:
            # Search only this POS orders
            condition += [('config_id', '=', config.id)]
        else:
            # Search globally by criteria
            condition += self._prepare_filter_query_for_pos(pos_session_id,
                                                            query)
        fields = self._prepare_fields_for_pos_list()
        return self.search_read(
            condition, fields, limit=config.iface_load_done_order_max_qty)

    @api.multi
    def _prepare_done_order_for_pos(self):
        self.ensure_one()
        order_lines = []
        payment_lines = []
        for order_line in self.lines:
            order_line = self._prepare_done_order_line_for_pos(order_line)
            order_lines.append(order_line)
        for payment_line in self.statement_ids:
            payment_line = self._prepare_done_order_payment_for_pos(
                payment_line)
            payment_lines.append(payment_line)
        return {
            'id': self.id,
            'date_order': self.date_order,
            'pos_reference': self.pos_reference,
            'name': self.name,
            'partner_id': self.partner_id.id,
            'fiscal_position': self.fiscal_position_id.id,
            'line_ids': order_lines,
            'statement_ids': payment_lines,
            'origin_invoice_id': bool(self.invoice_id),
            'returned_order_id': (self.returned_order_id and
                                  self.returned_order_id.pos_reference or
                                  False),
        }

    @api.multi
    def _prepare_done_order_line_for_pos(self, order_line):
        self.ensure_one()
        return {
            'product_id': order_line.product_id.id,
            'qty': order_line.qty,
            'price_unit': order_line.price_unit,
            'discount': order_line.discount,
        }

    @api.multi
    def _prepare_done_order_payment_for_pos(self, payment_line):
        self.ensure_one()
        return {
            'journal_id': payment_line.journal_id.id,
            'amount': payment_line.amount,
        }

    @api.multi
    def load_done_order_for_pos(self):
        self.ensure_one()
        return self._prepare_done_order_for_pos()

    @api.model
    def _process_order(self, pos_order):
        if (not pos_order.get('return') or
                not pos_order.get('returned_order_id')):
            return super()._process_order(pos_order)
        order = super(PosOrder,
                      self.with_context(do_not_check_negative_qty=True)
                      )._process_order(pos_order)
        returned_order_id = pos_order.get('returned_order_id')
        if isinstance(returned_order_id, int):
            order.returned_order_id = self.browse(returned_order_id)
        # Only if the order is returned from the browser saved orders.
        else:
            order.returned_order_id = self.search([
                ('pos_reference', '=', returned_order_id)])
        order.returned_order_id.refund_order_ids |= order
        return order
