from odoo import fields, models


class PosConfig(models.Model):
    _inherit = "pos.config"

    is_qztray = fields.Boolean(
        string="Enable QZ Tray Printing",
        help="Use QZ Tray instead of IoT Box for printing POS receipts.",
        default=False,
    )

    iface_qztray_printer_id = fields.Many2one(
        comodel_name="printing.printer",
        string="QZ Tray Printer",
        domain=[("backend", "=", "qztray")],
        help="Printer to use for POS receipts when QZ Tray mode is enabled.",
    )
