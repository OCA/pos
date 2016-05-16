# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    transfer_account_id = fields.Many2one(
        comodel_name='account.account', string='Transfer Account')
