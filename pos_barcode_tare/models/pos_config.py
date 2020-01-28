# -*- coding: utf-8 -*-

from openerp import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'
    tare_label_button = fields.Boolean(
        'Show tare label button',
        help="Print tare labels with this POS"
    )
