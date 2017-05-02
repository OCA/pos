# -*- coding: utf-8 -*-
# © 2017 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from openerp import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    available_in_pos = fields.Boolean(
        string='Available for POS',
    )
