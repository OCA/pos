# Copyright 2026 Open Source Integrators
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS PyWebDriver Integration",
    "version": "19.0.1.0.0",
    "category": "Point of Sale",
    "summary": "Print POS receipts via PyWebDriver proxy instead of IoT Box",
    "author": "Open Source Integrators, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "excludes": ["pos_iot"],
    "data": [
        "views/pos_config_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_pywebdriver/static/src/**/*.esm.js",
        ],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
}
