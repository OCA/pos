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

import logging

logger = logging.getLogger(__name__)


class PosPriceListConfig(models.Model):
    _inherit = 'pos.config'

    display_price_with_taxes = fields.Boolean(
        string='Price With Taxes',
        help="Display Prices with taxes on POS"
    )


class product_pricelist(models.Model):
    _inherit = 'product.pricelist'

    pos_config_ids = fields.Many2many(
        'pos.config', 'pricelist_posconfig_rel',
        'pricelist_id', 'pos_id', string='PoS',
        help='if empty will be available for all the pos')
