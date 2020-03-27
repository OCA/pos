# -*- coding: utf-8 -*-
from openerp import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'
    iface_self_weight = fields.Boolean(
        'Use that POS as self weighing station'
    )

    iface_self_weight_multi_label = fields.Boolean(
        'Enable weighing station to print multiple labels at once'
    )
