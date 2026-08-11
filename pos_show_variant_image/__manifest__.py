# Copyright 2026 INVITU (<https://www.invitu.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

{
    "name": "POS Show Variant Image",
    "summary": "Show the product variant image in the POS attribute selection popup",
    "version": "18.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "INVITU, Odoo Community Association (OCA)",
    "maintainers": ["cvinh"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_show_variant_image/static/src/scss/*.scss",
            "pos_show_variant_image/static/src/js/*.js",
            "pos_show_variant_image/static/src/xml/*.xml",
        ],
        "web.assets_tests": [
            "pos_show_variant_image/static/tests/tours/**/*",
        ],
    },
}
