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

from odoo import fields, models


class ResPartner(models.Model):
    _inherit = 'res.partner'

    credit_amount = fields.Float(
        string="Available Credit",
        digits=0,
        readonly=True,
    )
    credit_line_ids = fields.Many2many(
        comodel_name="account.bank.statement.line",
        string="Credit History",
        compute="_compute_credit_line"
    )

    def _compute_credit_line(self):
        credit_journals = self.env['account.journal'].sudo().search([
            ('is_credit', '=', True)
        ])
        for partner in self:
            lines = ABSLine= self.env['account.bank.statement.line']
            if credit_journals:
                args = [
                    ('partner_id', '=', partner.id),
                    ('journal_id', 'in', credit_journals.ids)
                ]
                lines = ABSLine.sudo().search(args)
            partner.credit_line_ids = lines

