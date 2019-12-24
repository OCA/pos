# -*- coding: utf-8 -*-
# © 2016 Robin Keunen, Coop IT Easy SCRL fs
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    require_product_quantity = fields.Boolean(
        string='Require product quantity in POS',
        default=False,
    )
