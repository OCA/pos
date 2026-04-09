# Copyright 2021 KMEE
# License LGPL-3 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "Pos Show Clock",
    "summary": """Point of Sale: Display Current Date and Time on POS sreen""",
    "version": "17.0.1.0.0",
    "author": "KMEE, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "maintainers": ["mileo", "ygcarvalh", "felipezago"],
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_show_clock/static/src/css/pos.css",
            "pos_show_clock/static/src/js/ChromeWidgets/Clock.esm.js",
            "pos_show_clock/static/src/xml/ChromeWidgets/Clock.xml",
        ]
    },
}
