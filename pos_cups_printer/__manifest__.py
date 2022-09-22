# Copyright 2022 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Printer Cups",
    "summary": """Point of Sale: Printer to Cups Server""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "development_status": "Alpha",
    "maintainers": ["mileo"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/pos_template.xml",
        "views/pos_config.xml",
    ],
}
