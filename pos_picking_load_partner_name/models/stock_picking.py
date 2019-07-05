# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    # Columns section
    partner_name = fields.Char(
        related='partner_id.name', store=True)

    @api.model
    def _prepare_filter_query_for_pos(self, pos_session_id, query):
        # Overwrite original function, replacing
        # partner_id field by partner_name
        return [
            '|', '|',
            ('name', 'ilike', query),
            ('origin', 'ilike', query),
            ('partner_name', 'ilike', query),
        ]
