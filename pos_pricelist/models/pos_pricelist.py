# -*- coding: utf-8 -*-
##############################################################################
# Point Of Sale - Pricelist for POS Odoo
# Copyright (C) 2015 Taktik (http://www.taktik.be)
# @author Adil Houmadi <ah@taktik.be>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
from openerp import models, fields


class PosPriceListConfig(models.Model):
    _inherit = 'pos.config'

    display_price_with_taxes = fields.Boolean(
        string='Price With Taxes',
        help="Display Prices with taxes on POS"
    )
    always_tax_included = fields.Boolean(
        string='Included taxes always included',
        help="If marked, the included taxes in the product will always be included in the POS order, even if the fiscal"
             " position changes them. This behaviour is the default one in the sale order process, so if you want POS"
             " and sale order processes to be equal, you should mark it.")
