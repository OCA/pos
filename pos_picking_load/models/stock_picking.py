# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, api, fields


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    # Field Section
    final_pos_order_id = fields.Many2one(
        string='Final PoS Order', comodel_name='pos.order', readonly=True,
        help="This picking has been canceled, because it has been replaced by"
        " this PoS Order")

    # Custom Section
    @api.model
    def _prepare_filter_for_pos(self, pos_session_id):
        picking_type_obj = self.env['stock.picking.type']
        picking_types = picking_type_obj.search(
            [('available_in_pos', '=', True)])
        return [
            ('picking_type_id', 'in', picking_types.ids),
            ('state', 'in', ['confirmed', 'partially_available', 'assigned']),
            ('invoice_state', '=', '2binvoiced'),
        ]

    @api.model
    def _prepare_filter_query_for_pos(self, pos_session_id, query):
        return [
            '|', '|',
            ('name', 'ilike', query),
            ('origin', 'ilike', query),
            ('partner_id', 'ilike', query),
        ]

    @api.model
    def _prepare_fields_for_pos_list(self):
        return ['name', 'partner_id', 'min_date', 'origin']

    @api.model
    def search_pickings_for_pos(self, query, pos_session_id):
        session_obj = self.env['pos.session']
        config = session_obj.browse(pos_session_id).config_id
        condition = self._prepare_filter_for_pos(pos_session_id) +\
            self._prepare_filter_query_for_pos(pos_session_id, query)
        fields = self._prepare_fields_for_pos_list()
        return self.search_read(
            condition, fields, limit=config.iface_load_picking_max_qty)

    @api.multi
    def load_picking_for_pos(self):
        self.ensure_one()
        pickinglines = []
        for line in self.move_lines.filtered(lambda x: x.state != 'cancel'):
            picking_line = {
                'name': line.name,
                'product_id': line.product_id.id,
                'quantity': line.product_uom_qty,
            }
            sale_order_line =\
                line.procurement_id and line.procurement_id.sale_line_id
            if sale_order_line:
                # Get price and discount of the order if available
                picking_line['price_unit'] = sale_order_line.price_unit
                picking_line['discount'] = sale_order_line.discount
            pickinglines.append(picking_line)
        return {
            'id': self.id,
            'name': self.name,
            'partner_id': self.partner_id.id,
            'line_ids': pickinglines,
        }

    @api.multi
    def update_from_origin_picking(self, origin_picking):
        if origin_picking.group_id:
            self.filtered(lambda p: not p.group_id).write({
                'group_id': origin_picking.group_id.id})

    @api.multi
    def action_confirm(self):
        """ Assign to same procurement group as the origin picking """
        if self.env.context.get('origin_picking_id'):
            self.update_from_origin_picking(
                self.browse(self.env.context['origin_picking_id']))
        return super(StockPicking, self).action_confirm()
