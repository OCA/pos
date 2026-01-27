# Copyright (C) 2025 - Today: GRAP (http://www.grap.coop)
# @author: Quentin DUPONT
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosOrder(models.Model):
    _inherit = "pos.order"

    margin = fields.Monetary(store=True)
    margin_percent = fields.Float(store=True)
