# Copyright 2019 Coop IT Easy SCRLfs
# @author Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    tare = fields.Float('Tare')
    container_weight = fields.Float('Container Weight')
    container_id = fields.Many2one(
        'pos.container',
        'Container')
