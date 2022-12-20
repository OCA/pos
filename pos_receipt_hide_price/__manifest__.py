# Copyright 2021 Akretion - Florian Mounier
# Copyright 2022 FactorLibre - Daniel Duque
{
    "name": "POS Receipt Hide Price",
    "summary": "Add button to remove price from receipt.",
    "author": "Akretion, FactorLibre, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "version": "16.0.1.0.0",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": [
            "pos_receipt_hide_price/static/src/js/ReceiptScreen.js",
            "pos_receipt_hide_price/static/src/js/ReprintReceiptScreen.js",
            "pos_receipt_hide_price/static/src/js/OrderReceipt.js",
            "pos_receipt_hide_price/static/src/xml/**/*",
        ],
    },
}
