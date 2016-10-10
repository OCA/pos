# -*- coding: utf-8 -*-
# Copyright (C) 2014 GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import barcode

from openerp.osv import fields
from openerp.osv.orm import AbstractModel


class barcode_generate_mixin(AbstractModel):
    _name = 'barcode.generate.mixin'

    _columns = {
        'barcode_rule_id': fields.many2one(
            'barcode.rule', 'Barcode Rule'),
        'barcode_base': fields.integer('Barcode Base'),
    }

    def generate_barcode(self, cr, uid, ids, context=None):
        vals = self._compute_custom_barcode(cr, uid, ids, context=context)
        for id in vals.keys():
            self.write(cr, uid, id, {'ean13': vals[id]}, context=context)
        return True

    def _compute_custom_barcode(self, cr, uid, ids, context=None):
        res = {}
        for item in self.browse(cr, uid, ids, context=context):
            if item.barcode_rule_id and item.barcode_base:
                pass
            barcode_class = barcode.get_barcode_class(
                item.barcode_rule_id.encoding)
            padding = item.barcode_rule_id.pattern.count('.')
            full_base = str(item.barcode_base).rjust(padding, '0')

            # Define barcode
            custom_code = item.barcode_rule_id.pattern
            custom_code = custom_code.replace('{', '').replace('}', '')
            custom_code = custom_code.replace(
                'D', self._get_barcode_replacement_char(
                    cr, uid, 'D', context=context))
            custom_code = custom_code.replace(
                'N', self._get_barcode_replacement_char(
                    cr, uid, 'N', context=context))
            custom_code = custom_code.replace('.' * padding, full_base)
            res[item.id] = barcode_class(custom_code)
        return res

    def _get_barcode_replacement_char(self, cr, uid, char, context=None):
        """
        Can be overload by inheritance
        Define wich character will be used instead of the 'N' or the 'D'
        char, present in the pattern of the barcode_rule_id
        """
        return '0'
