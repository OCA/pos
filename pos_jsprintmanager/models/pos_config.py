
from odoo import models, fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    use_jsprintmanager = fields.Boolean()
    jsprintmanager_default_receipt_printer = fields.Char(
        string='Default Printer for Receipts',
        help='Enter the name of the default printer to be used in receipts')
    jsprintmanager_output_format = fields.Selection(
        string='Printer output format',
        selection=[
            ('normal', 'Normal'),
            ('escpos', 'ESC/POS')
        ],
        help='Enter the format used by the printer')
    jsprintmanager_page_width = fields.Integer(
        string="Page Width",
        default=44,
        help="Technical field used in the building of the receipt"
    )
    jsprintmanager_qty_width = fields.Integer(
        string="Qty Width",
        default=12,
        help="Technical field used in the building of the receipt"
    )
    jsprintmanager_price_width = fields.Integer(
        string="Price Width",
        default=12,
        help="Technical field used in the building of the receipt"
    )
    jsprintmanager_totals_width = fields.Integer(
        string="Totals Width",
        default=22,
        help="Technical field used in the building of the receipt"
    )
