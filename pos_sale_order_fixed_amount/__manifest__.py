# Copyright 2025 Binhex - Adasat Torres de León
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point of Sale - Fixed Amount Sale Order",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": """Point of Sale - Fixed Amount Sale Order : allow create a
    down payment sale order with fixed amount""",
    "author": "Binhex ,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["pos_sale"],
    "data": [],
    "assets": {
        "point_of_sale.assets": [
            "pos_sale_order_fixed_amount/static/src/js/*.js",
        ]
    },
    "maintainers": ["adasatorres"],
    "installable": True,
}
