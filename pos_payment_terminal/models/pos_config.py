# -*- coding: utf-8 -*-
# © 2014-2016 Aurélien DUMAINE
# © 2015-2016 Akretion (Alexis de Lattre <alexis.delattre@akretion.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_payment_terminal = fields.Boolean(
        'Payment Terminal',
        help="A payment terminal is available on the Proxy")
