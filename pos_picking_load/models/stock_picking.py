# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, api, fields


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    # Field Section
    final_pos_order_id = fields.Many2one(
        string='Final PoS Order', comodel_name='pos.order', readonly=True,
        help="This picking has been canceled, because it has been replaced by"
        " this PoS Order")

    # Custom Section - Picking List Part
    @api.model
    def _prepare_filter_for_pos(self, pos_session_id):
        picking_type_obj = self.env['stock.picking.type']
        picking_types = picking_type_obj.search(
            [('available_in_pos', '=', True)])
        return [
            ('picking_type_id', 'in', picking_types.ids),
            ('state', 'in', ['confirmed', 'partially_available', 'assigned']),
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
        return ['name', 'partner_id', 'scheduled_date', 'origin']

    @api.model
    def search_pickings_for_pos(self, query, pos_session_id):
        session_obj = self.env['pos.session']
        config = session_obj.browse(pos_session_id).config_id
        condition = self._prepare_filter_for_pos(pos_session_id) +\
            self._prepare_filter_query_for_pos(pos_session_id, query)
        fields = self._prepare_fields_for_pos_list()
        return self.search_read(
            condition, fields, limit=config.iface_load_picking_max_qty)

    # Custom Section - Load Picking Part
    @api.model
    def _prepare_line_data_from_stock_move(self, move):
        picking_line_data = {
            'name': move.name,
            'product_id': move.product_id.id,
            'quantity': move.product_uom_qty,
        }
        sale_order_line = move.sale_line_id
        if sale_order_line:
            # Get price and discount of the order if available
            picking_line_data['price_unit'] = sale_order_line.price_unit
            picking_line_data['discount'] = sale_order_line.discount
        return picking_line_data

    @api.model
    def load_picking_for_pos(self, picking_id):
        picking = self.browse(picking_id)
        picking_lines = []
        for move in picking.move_lines.filtered(lambda x: x.state != 'cancel'):
            picking_lines.append(self._prepare_line_data_from_stock_move(move))
        return {
            'id': picking.id,
            'name': picking.name,
            'partner_id': picking.partner_id.id,
            'line_ids': picking_lines,
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
        return super().action_confirm()
