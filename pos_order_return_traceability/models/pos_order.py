# © 2020 Solvos Consultoría Informática (<http://www.solvos.es>)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    is_returnable = fields.Boolean(
        compute='_compute_is_returnable',
    )

    def _compute_is_returnable(self):
        for order in self:
            order.is_returnable = \
                order.amount_total >= 0 and \
                sum([l.max_returnable_qty(ignored_line_ids=[])
                     for l in order.lines]) > 0

    @api.model
    def _prepare_fields_for_pos_list(self):
        return super()._prepare_fields_for_pos_list() + ['is_returnable']

    def _prepare_done_order_line_for_pos(self, order_line):
        line = super()._prepare_done_order_line_for_pos(order_line)
        return {
            **line,
            'id': order_line.id,
            'qty_returnable': order_line.max_returnable_qty(ignored_line_ids=[])
        }
