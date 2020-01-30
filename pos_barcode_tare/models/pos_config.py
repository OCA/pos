# -*- coding: utf-8 -*-

from openerp import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'
    iface_tare_label = fields.Boolean(
        'Show tare label button',
        help="Print tare labels with this POS"
    )

    iface_tare_barcode_sequence_id = fields.Integer(
        'Barcode nomenclature sequence ID',
        default=36,
        required=True,
        help="""The nomenclature ID gives barcode pattern.
        It can be found in POS Barcode Nomenclatures. The expected barcode
        pattern is 21.....{NNDDD}"""
    )
