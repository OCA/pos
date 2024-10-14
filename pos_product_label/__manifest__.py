# Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Product Label",
    "summary": "Print product labels from the POS",
    "version": "16.0.1.0.2",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "maintainers": ["ivantodorovich"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "depends": ["point_of_sale"],
    "data": ["views/res_config_settings.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_label/static/src/**/*.js",
            "pos_product_label/static/src/**/*.xml",
            "pos_product_label/static/src/**/*.scss",
        ],
    },
}
