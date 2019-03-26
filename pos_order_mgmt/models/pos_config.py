# Copyright 2018 GRAP - Sylvain LE GAL
# Copyright 2018 Tecnativa S.L. - David Vidal
# Copyright 2019 Coop IT Easy SCRLfs
#                   Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_reprint_done_order = fields.Boolean(
        string='Reprint Done Orders',
        default=True,
        help='Allows to reprint already done orders in the frontend',
        oldname='iface_load_done_order',
    )
    iface_return_done_order = fields.Boolean(
        string='Return Done Orders',
        default=True,
        help='Allows to return already done orders in the frontend',
        oldname='iface_load_done_order',
    )
    iface_load_done_order_max_qty = fields.Integer(
        string='Max. Done Orders Quantity To Load',
        default=10,
        required=True,
        help='Maximum number of orders to load on the PoS at its init. '
             'Set it to 0 to load none (it\'s still posible to load them by '
             'ticket code).',
    )
