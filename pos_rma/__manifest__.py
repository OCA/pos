# Copyright 2025 APSL-Nagarro Antoni Marroig
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS RMA",
    "summary": "Point of Sale RMA Management",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "APSL-Nagarro, Odoo Community Association (OCA)",
    "maintainers": ["peluko00"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": ["point_of_sale", "rma"],
    "data": [
        "views/pos_order_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_rma/static/src/**/*",
        ],
        "web.assets_tests": [
            "pos_rma/static/tests/tours/**/*",
        ],
    },
}
