# Copyright 2018 GRAP - Sylvain LE GAL
# Copyright 2018 Tecnativa S.L. - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_load_done_order = fields.Boolean(
        string='Load Done Orders',
        default=True,
        help='Allows to load already done orders in the frontend to operate '
             'over them, allowing reprint the tickets, return items, etc.',
    )
    iface_load_done_order_max_qty = fields.Integer(
        string='Max. Done Orders Quantity To Load',
        default=10,
        required=True,
        help='Maximum number of orders to load on the PoS at its init. '
             'Set it to 0 to load none (it\'s still posible to load them by '
             'ticket code).',
    )
