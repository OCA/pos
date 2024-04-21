# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
{
    "name": "POS Lot Barcode",
    "summary": "Scan barcode to enter lot/serial numbers",
    "version": "17.0.1.0.1",
    "development_status": "Alpha",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "data": [
        "security/ir.model.access.csv",
    ],
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_lot_barcode/static/src/js/**/*",
            "pos_lot_barcode/static/src/xml/**/*.xml",
        ],
        "web.assets_tests": [
            "pos_lot_barcode/static/tests/tours/**/*",
        ],
    },
}
