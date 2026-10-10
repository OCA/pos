# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Order Line Change Variant",
    "summary": "Change the product variant of an existing Point of Sale order line",
    "version": "18.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "INVITU, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "installable": True,
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_order_line_change_variant/static/src/**/*",
        ],
        "web.assets_tests": [
            "pos_order_line_change_variant/static/tests/tours/**/*",
        ],
    },
}
