# Copyright 2024 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Divider Order Summary",
    "summary": "POS - Divider order summary",
    "version": "18.0.1.0.0",
    "development_status": "Beta",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "maintainers": ["henrybackman"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_divide_order_summary/static/src/xml/pos_divide_order_summary.xml",
        ],
        "web.assets_tests": [
            "pos_divide_order_summary/static/tests/tours/**/*",
        ],
    },
    "sequence": 10,
}
