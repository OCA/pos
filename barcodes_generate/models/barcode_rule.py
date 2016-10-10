# -*- coding: utf-8 -*-
# Copyright (C) 2014 GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.osv import fields
from openerp.osv.orm import Model


class barcode_rule(Model):
    _inherit = 'barcode.rule'

    _columns = {
        'is_product_available': fields.boolean(
            string='Available for Products', help="If checked, users with"
            " specific access right will have the possibility to generate"
            " barcodes with this pattern for the products."),
        'is_partner_available': fields.boolean(
            string='Available for Partners', help="If checked, users with"
            " specific access right will have the possibility to generate"
            " barcodes with this pattern for the partners."),
    }

    # TODO set constraint
    # is_product_available and is_partner_available:
    # - should be possible only for ean13 barcode rule
    # - should be possible only if pattern contains at leas one '.' char
