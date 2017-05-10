# -*- coding: utf-8 -*-
# Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import _, api, models


class BarcodeRule(models.Model):
    _inherit = 'barcode.rule'

    @api.model
    def _get_type_selection(self):
        res = super(BarcodeRule, self)._get_type_selection()
        res.append(
            ('price_to_weight', _('Priced Product (Computed Weight)')))
        return res
