# Copyright 2019 Druidoo - Iván Todorovich
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    auto_apply_credit_amount = fields.Boolean(
        'Automatic Pay by Credit Amount',
        default=True
    )
