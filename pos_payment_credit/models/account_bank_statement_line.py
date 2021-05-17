# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright since 2009 Trobz (<https://trobz.com/>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from odoo import api, fields, models


class AccountBankStatementLine(models.Model):
    _inherit = 'account.bank.statement.line'

    partner_id = fields.Many2one(
        inverse="_inverse_partner_id"
    )

    @api.multi
    def _inverse_partner_id(self):
        """
        Update the credit amount
        """
        lines = self.filtered(
            lambda l: l.amount and l.partner_id and l.journal_id.is_credit)
        for line in lines:
            line.sudo().partner_id.credit_amount -= line.amount
