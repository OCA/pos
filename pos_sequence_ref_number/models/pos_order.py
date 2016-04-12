# -*- coding: utf-8 -*-
# © 2016 Acsone SA/NV (http://www.acsone.eu)
# © 2016 Eficent Business and IT Consulting Services S.L.
# (http://www.eficent.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from openerp import api, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def sequence_number_sync(self, vals):
        next = vals.get('_sequence_ref_number', False)
        next = int(next) if next else False
        if vals.get('session_id') and next is not False:
            session = self.env['pos.session'].sudo().browse(vals['session_id'])
            if next != session.config_id.sequence_id.number_next_actual:
                session.config_id.sequence_id.number_next_actual = next
        if vals.get('_sequence_ref_number') is not None:
            del vals['_sequence_ref_number']

    @api.model
    def _order_fields(self, ui_order):
        vals = super(PosOrder, self)._order_fields(ui_order)
        vals['_sequence_ref_number'] = ui_order.get('sequence_ref_number')
        return vals

    @api.model
    def create(self, vals):
        self.sequence_number_sync(vals)
        order = super(PosOrder, self).create(vals)
        return order
