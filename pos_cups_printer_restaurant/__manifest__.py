# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Printer Cups Restaurant",
    "summary": """Point of Sale: Printer to Cups Server""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo"],
    "development_status": "Alpha",
    "depends": [
        "pos_cups_printer",
        "pos_restaurant",
    ],
    "data": [
        "views/pos_template.xml",
        "views/restaurant_printer_view.xml",
    ],
}
