# -*- coding: utf-8 -*-
from odoo import models, fields, api, _


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    invisible = fields.Boolean('Invisible Line', default=False)

