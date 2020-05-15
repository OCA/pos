from odoo import _, models, fields

class BarcodeRule(models.Model):
    _inherit = 'barcode.rule'

    type = fields.Selection(selection_add=[
        ('tare', _('Tare'))
    ])

