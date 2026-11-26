# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Receipt Hide Attribute No Variant",
    "summary": "Hide no-variant attribute values on the POS receipt and kitchen ticket",
    "version": "18.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "INVITU, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/product_attribute_views.xml",
    ],
    "installable": True,
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_receipt_hide_attribute_no_variant/static/src/**/*",
        ],
        "web.assets_tests": [
            "pos_receipt_hide_attribute_no_variant/static/tests/tours/**/*",
        ],
    },
}
