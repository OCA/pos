# Copyright 2023 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Split Invoice",
    "summary": """
        Allow to generatea secondary invoice from a point of sale order for a second partner""",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,INVITU,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": [
        "views/account_move.xml",
        "views/pos_order.xml",
        "views/pos_session.xml",
        "views/product_pricelist.xml",
    ],
    "demo": [],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_order_split_invoice/static/src/models/order.esm.js",
            "pos_order_split_invoice/static/src/models/order_line.esm.js",
            "pos_order_split_invoice/static/src/models/product.esm.js",
            "pos_order_split_invoice/static/src/generic_components/product_card.esm.js",
            "pos_order_split_invoice/static/src/generic_components/product_card.xml",
            "pos_order_split_invoice/static/src/screens/product_screen/product_list.xml",
        ],
        "web.assets_tests": [
            "pos_order_split_invoice/static/tests/tours/**/*",
        ],
    },
}
