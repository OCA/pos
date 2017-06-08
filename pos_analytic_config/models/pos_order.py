# -*- coding: utf-8 -*-
# © 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, api


class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def _prepare_analytic_account(self, line):
        return line.order_id.session_id.config_id.account_analytic_id.id
