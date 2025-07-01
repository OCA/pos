# Copyright 2025 Binhex - Adasat Torres de León
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale - Hide Receipt Line",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Hide receipt line in Point of Sale",
    "author": "Binhex, Odoo Community Association (OCA)",
    "maintainers": ["adasatorres"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/product_template_views.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_hide_receipt_line/static/src/js/**/*.js",
            "pos_hide_receipt_line/static/src/xml/**/*.xml",
        ],
    },
}
