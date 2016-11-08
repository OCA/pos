# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today GRAP (http://www.grap.coop)
# Copyright (C) 2016-Today La Louve (http://www.lalouve.net)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests.common import TransactionCase


class Tests(TransactionCase):
    """Tests for 'Barcodes Generate"""

    def setUp(self):
        super(Tests, self).setUp()
        self.template_obj = self.env['product.template']
        self.product_obj = self.env['product.product']
        self.partner_obj = self.env['res.partner']
        self.sequence_obj = self.env['ir.sequence']

    # Test Section
    def test_01_manual_generation_template(self):
        self.template_mono = self.template_obj.browse(self.ref(
            'barcodes_generate.product_template_barcode_mono_variant'))
        self.assertEqual(
            self.template_mono.barcode, "2000050000003",
            "Incorrect Manual Barcode Generation for non varianted Template."
            " Pattern : %s - Base : %s" % (
                self.template_mono.barcode_rule_id.pattern,
                self.template_mono.barcode_base))

    def test_02_manual_generation_product(self):
        self.product_variant_1 = self.product_obj.browse(self.ref(
            'barcodes_generate.product_product_barcode_variant_1'))
        self.assertEqual(
            self.product_variant_1.barcode, "2010001000006",
            "Incorrect Manual Barcode Generation for varianted Product."
            " Pattern : %s - Base : %s" % (
                self.product_variant_1.barcode_rule_id.pattern,
                self.product_variant_1.barcode_base))

    def test_03_sequence_generation_partner(self):
        self.partner = self.partner_obj.browse(self.ref(
            'barcodes_generate.res_partner_barcode'))
        self.partner.generate_barcode()

        # Get Expected value
        self.sequence = self.sequence_obj.browse(self.ref(
            'barcodes_generate.partner_ir_sequence'))
        expected_value = self.sequence.number_next_actual

        self.assertEqual(
            self.partner.barcode_base, expected_value,
            "Incorrect base Generation (by sequence) for Partner.")
        self.assertEqual(
            self.partner.barcode, "0420000000013",
            "Barcode Generation (by sequence) for Partner."
            "Incorrect EAN13 Generated. Pattern : %s - Base : %s" % (
                self.partner.barcode_rule_id.pattern,
                self.partner.barcode_base))
