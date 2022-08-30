# Copyright 2021 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Debranding",
    "summary": """Point of Sale: Remove Odoo SA Logo from POS""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo"],
    "depends": [
        "point_of_sale",
    ],
    "qweb": ["static/src/xml/Chrome.xml"],
}
