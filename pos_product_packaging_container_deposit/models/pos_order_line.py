# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    is_container_deposit = fields.Boolean()
