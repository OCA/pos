# -*- coding: utf-8 -*-
# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import api, fields, models


class PosConfig(models.Model):

    _inherit = 'pos.config'

    use_payment_terminal_server = fields.Boolean()
    iface_payment_terminal_server = fields.Char()
    iface_payment_terminal_id = fields.Char()

    @api.onchange('use_payment_terminal_server')
    def onchange_use_payment_terminal_server(self):
        if self.iface_payment_terminal_id:
            self.iface_payment_terminal = False
