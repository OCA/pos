# Copyright 2021 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Show Clock",
    "summary": """Point of Sale: Display Current Date and Time on POS sreen""",
    "version": "14.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo", "ygcarvalh", "felipezago"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        # Templates
        "views/pos_template.xml",
    ],
    "qweb": ["static/src/xml/ChromeWidgets/Clock.xml"],
}
