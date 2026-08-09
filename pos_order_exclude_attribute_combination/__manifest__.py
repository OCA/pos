# Copyright (C) 2022 Open Source Integrators (https://www.opensourceintegrators.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "POS Orders - Limit seletion of not allowed attribute combinations",
    "version": "16.0.1.0.0",
    "summary": """Product attribute values allow to set Exclude for
        to make some combinations unavailable.""",
    "author": "Open Source Integrators, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "maintainer": "Open Source Integrators",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "maintainers": ["ursais"],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_order_exclude_attribute_combination/static/src/js/**/*.js",
            "pos_order_exclude_attribute_combination/static/src/xml/**/*.xml",
            "pos_order_exclude_attribute_combination/static/src/scss/**/*.scss",
        ],
    },
}
