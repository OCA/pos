from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iface_tare_method = fields.Selection([
        ('manual', 'Input the tare manually'),
        ('barcode', 'Scan a barcode to set the tare'),
        ('both', 'Manual input and barcode'),
        ],
        string='Tare input method',
        default='both',
        help="Select tare method:\n"
        "* 'manual' : the scale screen has an extra tare input field;\n"
        "* 'barecode' : (scan a barcode to tare the selected order line;\n"
        "* 'both' : manual input and barcode methods are enabled;",
    )
