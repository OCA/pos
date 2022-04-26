# Copyright (C) 2022 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class AccountInvoice(models.Model):
    _inherit = 'account.invoice'

    place_id = fields.Many2one(
        string='Place', comodel_name='pos.place')
