# Copyright 2022 KMEE (<http://www.kmee.com.br>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, models, fields


class PosCancelReason(models.Model):
    _name = 'pos.cancel.reason'

    name = fields.Char(
        string='Reason',
        required=True,
    )

    active = fields.Boolean(
        string='Active',
        default=True,
    )
