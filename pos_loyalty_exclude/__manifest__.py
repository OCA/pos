# Copyright 2024 Camptocamp
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Loyalty Exclude",
    "summary": "Exclude products from sale loyalty program in POS",
    "version": "16.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "depends": ["sale_loyalty_exclude", "pos_loyalty"],
    "installable": True,
    "assets": {
        "web.assets_tests": [
            "pos_loyalty_exclude/static/src/tours/**/*",
        ],
    },
    "auto_install": True,
}
