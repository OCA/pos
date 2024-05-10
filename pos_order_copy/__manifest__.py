# Copyright 2024 Dixmit,INVITU
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Order Copy",
    "summary": """
        Copy Orders from PoS Frontend""",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,INVITU,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_order_copy/static/src/**/*.js",
            "pos_order_copy/static/src/**/*.xml",
        ],
    },
    "data": [],
    "demo": [],
}
