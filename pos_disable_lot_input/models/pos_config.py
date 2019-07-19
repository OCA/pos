# Copyright 2019 Tecnativa S.L. - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_lot_input = fields.Boolean(
        string='Input lots from the frontend',
        default=True,
        help='Ask for the lot in the frontend (default) or inform them in the'
             'backend picking later.',
    )
