# Copyright 2024 Dixmit
# Copyright 2024 INVITU
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Lot Expiry",
    "summary": """
        Evaluate expiry of lot""",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,INVITU,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale", "product_expiry", "pos_lot_selection"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_product_expiry/static/src/js/**/*.js",
        ],
        "web.assets_tests": [
            "pos_product_expiry/static/tests/tours/**/*",
        ],
    },
    "data": [
        "views/res_config_settings_views.xml",
    ],
}
