# Copyright 2023 Akretion - Florian Mounier
{
    "name": "POS Show Discount Percentage",
    "summary": "Show percentage of product discount.",
    "author": "Akretion, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "version": "14.0.1.0.0",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/assets.xml"],
    "qweb": [
        "static/src/xml/OrderReceipt.xml",
    ],
}
