# Copyright 2019 Coop IT Easy SCRLfs
# 	    Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models, fields


class BarcodeRule(models.Model):
    _inherit = 'barcode.rule'

    type = fields.Selection(
        selection_add=[('container', 'Container unit')],
    )
