# -*- coding: utf-8 -*-
from openerp import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'
    iface_self_weight = fields.Boolean(
        'Use that POS as self weighting station'
    )
