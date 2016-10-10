# -*- coding: utf-8 -*-
# Copyright (C) 2014 GRAP (http://www.grap.coop)
# Copyright (C) 2016-Today GRAP (http://www.lalouve.net)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import models, fields


class barcode_rule(models.Model):
    _inherit = 'barcode.rule'

    is_product_available = fields.Boolean(
        string='Available for Products', help="If checked, users with"
        " specific access right will have the possibility to generate"
        " barcodes with this pattern for the products.")

    is_partner_available = fields.Boolean(
        string='Available for Partners', help="If checked, users with"
        " specific access right will have the possibility to generate"
        " barcodes with this pattern for the partners.")
