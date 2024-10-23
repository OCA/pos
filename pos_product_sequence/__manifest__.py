# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "POS - Product Sequence",
    "version": "16.0.1.0.0",
    "summary": "Manage Product sequence in Point Of Sale",
    "author": "Open Source Integrators, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "maintainer": "Open Source Integrators",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": ["views/product_view.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_sequence/static/src/js/**/*.js",
        ],
    },
    "maintainers": ["ursais"],
    "installable": True,
}
