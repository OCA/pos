# Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models, fields


class BarcodeRule(models.Model):
    _inherit = 'barcode.rule'

    type = fields.Selection(selection_add=[('price_change_rate', 'Priced Product with Change Rate')], ondelete={'price_change_rate': 'set default'})
