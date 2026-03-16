# SPDX-FileCopyrightText: 2026 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "PoS Product Fixed Price",
    "summary": "Add the possibility to set a product as having a fixed price in "
    "the PoS that can only be changed by a manager.",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "maintainers": ["mihien"],
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/product_view.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_fixed_price/static/src/**/*.js",
            "pos_product_fixed_price/static/src/**/*.xml",
        ],
    },
}
