from odoo import fields, models


class RestaurantPrinter(models.Model):

    _inherit = "restaurant.printer"

    printer_type = fields.Selection(selection_add=[("cups", "Cups")])
    cups_printer_name = fields.Char(
        string="Cups Printer Name",
    )
