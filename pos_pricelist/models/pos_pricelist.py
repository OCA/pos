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
from openerp import models, fields, api
from openerp import http

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

    pos_config_ids = fields.Many2many('pos.config', 'pricelist_posconfig_rel', 'pricelist_id', 'pos_id', string='PoS', help='if empty will be available for all the pos')

    @api.model
    def search_read(self, domain=None, fields=None, offset=0, limit=None, order=None):
        """
        If request is from pos retrieve only the pricelist applicable.
            If pricelist has none pos_config_ids assume is available for all the pos
        """
        if 'pos' in http.request.httprequest.headers.get('Referer', ''):
            pos_config_id = self.env.user.pos_config.id
            q = """
                SELECT pl.id
                FROM product_pricelist pl
                    LEFT JOIN pricelist_posconfig_rel ppr
                    ON ppr.pricelist_id = pl.id
                WHERE pl.type ~ 'sale' AND pl.active IS True
                    AND (pos_id=%(pos_id)s OR pos_id IS NULL)
                UNION
                    SELECT pricelist_id FROM pos_config WHERE id=%(pos_id)s  -- Ensure default pricelist is retrieved
            """
            q_params = {'pos_id': pos_config_id}
            self._cr.execute(q, q_params)
            pl_ids = [i[0] for i in self._cr.fetchall()]
            domain = [('id', 'in', pl_ids)]
            logger.debug('Overriden domain for product.pricelist on pos %s: %s' % (self.env.user.pos_config.name, domain))
        res = super(product_pricelist, self).search_read(domain, fields, offset, limit, order)
        return res
