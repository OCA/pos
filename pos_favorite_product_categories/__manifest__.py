# Copyright 2022 KMEE
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Favorite Product Categories",
    "summary": """
        Pins a bar with favorite POS product categories""",
    "version": "16.0.1.0.0",
    "license": "AGPL-3",
    "author": "KMEE,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/pos_category.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_favorite_product_categories/static/src/js/**/**.js",
            "pos_favorite_product_categories/static/src/xml/**/**.xml",
        ],
    },
}
