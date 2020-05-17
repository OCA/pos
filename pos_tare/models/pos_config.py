from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'
    
    iface_tare_method = fields.Selection([
        ('Manual', 'Input the tare manually'),
        ('Barcode', 'Scan a barcode to set the tare'),
        ('Both', 'Manual input and barcode'),
        ],
        string='Tare input method',
        default='Both',
        help="Select tare method:\n"
        "* 'Manual (the scale screen has an extra tare input field)';\n"
        "* 'Barecode (scan a barcode to tare the selected order line)';\n"
        "* 'Both manual input and barcode methods are enabled';",
    ) 
