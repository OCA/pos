# -*- coding: utf-8 -*-
# Copyright (C) 2014 GRAP (http://www.grap.coop)
# Copyright (C) 2016-Today GRAP (http://www.lalouve.net)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import barcode

from openerp import models, fields, api, exceptions


class barcode_generate_mixin(models.AbstractModel):
    _name = 'barcode.generate.mixin'

    # Column Section
    barcode_rule_id = fields.Many2one(
        string='Barcode Rule', comodel_name='barcode.rule')

    barcode_base = fields.Char(string='Barcode Base')

    # Constrains Section
    @api.multi
    @api.constrains('barcode_base')
    def _constrains_barcode_base(self):
        for item in self:
            if item.barcode_base and not item.barcode_base.isdigit():
                raise exceptions.Warning(_("Barcode Base should be numeric"))

    # View Section
    @api.multi
    def generate_base(self):
        for item in self:
            padding = item.barcode_rule_id.pattern.count('.')
            full_padding = item.barcode_rule_id.pattern.count('.') +\
                item.barcode_rule_id.pattern.count('N') +\
                item.barcode_rule_id.pattern.count('D')
            generic_code = self._get_custom_barcode(item)
            full_generic_code = self._get_custom_barcode(item, True)
            if generic_code:
                generic_code = generic_code.replace(
                    '.' * padding, '_' * padding)
                full_generic_code = full_generic_code.replace(
                    '.' * full_padding, '_' * full_padding)
                reserved_barcodes = self.search(
                    [('barcode', 'ilike', full_generic_code)]).mapped(
                        'barcode')
                next_base = str(self._get_next_integer_base(
                    item, generic_code, reserved_barcodes)).rjust(padding, '0')
                item.barcode_base = next_base

    @api.multi
    def generate_barcode(self):
        for item in self:
            padding = item.barcode_rule_id.pattern.count('.')
            full_base = str(item.barcode_base).rjust(padding, '0')
            custom_code = self._get_custom_barcode(item)
            if custom_code:
                custom_code = custom_code.replace('.' * padding, full_base)
                barcode_class = barcode.get_barcode_class(
                    item.barcode_rule_id.encoding)
                item.barcode = barcode_class(custom_code)

    @api.multi
    def generate_base_barcode(self):
        for item in self:
            if not item.barcode_base:
                item.generate_base()
            item.generate_barcode()

    # Custom Section
    @api.model
    def _get_next_integer_base(self, item, generic_code, reserved_barcodes):
        """Given a list of reserved_barcodes, This will return the next"
        base barcode. By default, return the max barcode base + 1.
        Overload / Overwrite this function to provide custom behaviour.
        (specially, fill gaps functionnality).
        generic_code should have the '_' pattern.
        """
        if not reserved_barcodes:
            return 1
        max_barcode = sorted(reserved_barcodes)[len(reserved_barcodes) - 1]
        begin = generic_code.find('_')
        end = begin + generic_code.count('_')
        return int(max_barcode[begin:end]) + 1

    @api.model
    def _get_custom_barcode(self, item, full=False):
        """
            if the pattern is '23.....{NNNDD}'
            this function will return '23.....00000'
            or return                 '23..........'
            if 'full' is set to True
        """
        if not item.barcode_rule_id:
                return False

        # Define barcode
        custom_code = item.barcode_rule_id.pattern
        custom_code = custom_code.replace('{', '').replace('}', '')
        if not full:
            custom_code = custom_code.replace(
                'D', self._get_replacement_char('D'))
            return custom_code.replace(
                'N', self._get_replacement_char('N'))
        else:
            return custom_code.replace('D', '.').replace('N', '.')

    @api.model
    def _get_replacement_char(self, char):
        """
        Can be overload by inheritance
        Define wich character will be used instead of the 'N' or the 'D'
        char, present in the pattern of the barcode_rule_id
        """
        return '0'
