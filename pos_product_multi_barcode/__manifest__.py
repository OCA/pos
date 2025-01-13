{
    "name": "PoS Product multi barcode",
    "summary": "Make product multi barcodes usable in the point of sale",
    "version": "16.0.1.0.2",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Akretion, Odoo Community Association (OCA)",
    "maintainer": "PierrickBrun",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
        "product_multi_barcode",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_product_multi_barcode/static/src/js/db.js",
        ]
    },
    "demo": [],
    "qweb": [],
}
