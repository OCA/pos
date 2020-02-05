# -*- coding: utf-8 -*-

from openerp import _, models, api


class BarcodeRule(models.Model):
    _inherit = 'barcode.rule'

    @api.model
    def _get_type_selection(self):
        res = super(BarcodeRule, self)._get_type_selection()
        res.append(
            ('tare', _('Tare')))
        return res
