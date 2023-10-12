# Copyright 2023 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "PoS Product packaging multi barcode",
    "summary": "Make product packaging multi barcodes usable in the point of sale",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "auto_install": True,
    "depends": [
        "point_of_sale",
        "product_packaging_multi_barcode",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_packaging_multi_barcode/static/src/js/db.js",
        ]
    },
}
