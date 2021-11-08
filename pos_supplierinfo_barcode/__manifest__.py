# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of sale - Supplier barcodes",
    "summary": "Search products by supplier barcode",
    "version": "14.0.1.0.0",
    "development_status": "Beta",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "TAKOBI, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "auto_install": True,
    "depends": [
        "product_supplierinfo_barcode",
        "point_of_sale",
    ],
    "data": [
        "views/assets.xml",
    ],
    "demo": [],
}
