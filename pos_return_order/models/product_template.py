# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from openerp import fields, models


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # Column Section
    pos_allow_negative_qty = fields.Boolean(
        string='Allow Negative Quantity on PoS')
