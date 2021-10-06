# Copyright 2021 Akretion - Florian Mounier
{
    "name": "POS Receipt Hide Price",
    "summary": "Add button to remove price from receipt.",
    "author": "Akretion, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "version": "14.0.1.0.1",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/assets.xml"],
    "qweb": [
        "static/src/xml/OrderReceipt.xml",
        "static/src/xml/HidePrice.xml",
        "static/src/xml/ReceiptScreen.xml",
        "static/src/xml/ReprintReceiptScreen.xml",
    ],
}
