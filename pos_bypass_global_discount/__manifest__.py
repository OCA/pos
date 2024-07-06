# Copyright 2024 Camptocamp (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Bypass Global Discount",
    "summary": "",
    "version": "16.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "depends": ["pos_discount", "pos_loyalty", "sale_global_discount"],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_bypass_global_discount/static/src/js/**/*.js",
        ],
        "web.assets_tests": [
            "pos_bypass_global_discount/static/src/tours/**/*",
        ],
    },
}
