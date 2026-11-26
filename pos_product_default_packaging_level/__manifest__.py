# Copyright 2026 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Product Default Packaging Level",
    "summary": """This module allows to show product default packaging level""",
    "version": "18.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "maintainers": ["rousseldenis"],
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale", "product_packaging_level"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_product_default_packaging_level/static/src/ProductScreen.esm.js",
            "pos_product_default_packaging_level/static/src/**/*.xml",
        ]
    },
}
