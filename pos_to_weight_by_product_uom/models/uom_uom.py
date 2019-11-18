# Copyright 2017, Grap
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class UomUom(models.Model):
    _inherit = 'uom.uom'

    to_weigh = fields.Boolean(
        related='category_id.to_weigh',
        readonly=True)
