# Copyright 2025 Binhex <https://www.binhex.cloud>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Sale Product Identification Numbers Pos",
    "author": "Binhex,Odoo Community Association (OCA)",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "depends": ["point_of_sale", "sale_product_identification"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "sale_product_identification_pos/static/src/**/*.esm.js",
            "sale_product_identification_pos/static/src/**/*.xml",
        ],
        "web.assets_unit_tests": [
            "sale_product_identification_pos/static/tests/unit/**/*.js",
        ],
    },
}
