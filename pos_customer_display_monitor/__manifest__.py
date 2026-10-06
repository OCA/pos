# Copyright 2026 (APSL - Nagarro) Bernat Obrador
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Customer Display Monitor",
    "summary": "Select the monitor used by the POS customer display",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "license": "AGPL-3",
    "author": "APSL-Nagarro, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "maintainers": ["BernatObrador"],
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_customer_display_monitor/static/src/app/*.js",
            "pos_customer_display_monitor/static/src/app/*.xml",
        ],
        "point_of_sale.assets_qunit_tests": [
            "pos_customer_display_monitor/static/tests/unit/**/*.js",
        ],
    },
    "installable": True,
    "application": False,
}
