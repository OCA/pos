# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
{
    "name": "POS Lot Barcode",
    "summary": "Scan barcode to enter lot/serial numbers",
    "version": "15.0.1.0.0",
    "development_status": "Alpha",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_lot_barcode/static/src/js/**/*.js",
        ],
        "web.assets_qweb": [
            "pos_lot_barcode/static/src/xml/**/*.xml",
        ],
    },
}
