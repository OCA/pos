# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of sale - Search products by supplier",
    "summary": "Search products by supplier data",
    "version": "16.0.1.0.0",
    "development_status": "Beta",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Tecnativa, TAKOBI, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "auto_install": False,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": [
            "/pos_supplierinfo_search/static/src/js/db.js",
        ],
    },
}
