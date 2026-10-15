{
    "name": "POS Barcode Block",
    "version": "18.0.1.0.0",
    "category": "Point of Sale",
    "summary": "Block the POS when an unknown barcode is scanned",
    "author": "APSL - Nagarro, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "assets": {
        "web.assets_tests": [
            "pos_barcode_block/static/tests/pos/tours/**/*",
        ],
        "point_of_sale._assets_pos": [
            "pos_barcode_block/static/src/app/barcode_block.esm.js",
        ],
    },
    "license": "AGPL-3",
    "maintainers": ["miquelpascual"],
}
