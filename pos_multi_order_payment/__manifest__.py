# Copyright 2023 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Multi Order Payment",
    "summary": """
        Allow to pay multiple orders with the same payment""",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,INVITU,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_multi_order_payment/static/src/app/screens/payment_screen/payment_screen.esm.js",
            "pos_multi_order_payment/static/src/app/screens/payment_screen/payment_screen.xml",
            "pos_multi_order_payment/static/src/app/screens/receipt_screen/receipt_screen.esm.js",
            "pos_multi_order_payment/static/src/app/screens/receipt_screen/receipt_screen.xml",
            "pos_multi_order_payment/static/src/app/models.esm.js",
        ],
    },
    "data": [],
    "demo": [],
}
