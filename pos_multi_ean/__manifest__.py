# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License AGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of sale - Multi EAN support",
    "summary": "Search products by multiple EAN",
    "version": "12.0.1.0.1",
    "development_status": "Beta",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "TAKOBI, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "auto_install": True,
    "depends": [
        "product_multi_ean",
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
    ],
    "demo": [
    ],
}
