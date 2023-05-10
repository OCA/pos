# Copyright (C) 2023 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models, _
from odoo.addons.http_routing.models.ir_http import slug, unslug
from odoo.addons.website.models import ir_http
from odoo.tools.translate import html_translate
from odoo.osv import expression


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    pos_sequence = fields.Integer('POS Sequence', help="Determine the display order in the Point of Sale",
                                      default=lambda self: self._default_pos_sequence(), copy=False)

    def _default_pos_sequence(self):
        ''' We want new product to be the last (highest seq).
        Every product should ideally have an unique sequence.
        Default sequence (10000) should only be used for DB first product.
        As we don't resequence the whole tree (as `sequence` does), this field
        might have negative value.
        '''
        self._cr.execute("SELECT MAX(pos_sequence) FROM %s" % self._table)
        max_sequence = self._cr.fetchone()[0]
        if max_sequence is None:
            return 10000
        return max_sequence + 5
