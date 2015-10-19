# -*- encoding: utf-8 -*-
##############################################################################
#
#    Point Of Sale - Store Draft Orders Module for Odoo
#    Copyright (C) 2013-Today GRAP (http://www.grap.coop)
#    @author Julien WESTE
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
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

from openerp import api, fields, models


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Column Section
    is_partial_paid = fields.Boolean(
        string='Is Partially Paid', compute='compute_is_partial_paid',
        store=True)

    # Compute Section
    @api.one
    @api.depends('state', 'statement_ids')
    def compute_is_partial_paid(self):
        self.is_partial_paid =\
            (self.state == 'draft') and len(self.statement_ids) != 0
