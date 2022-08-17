# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)
{
    "name": "POS Lot Base",
    "summary": "Load lot/serial numbers into POS",
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
    "data": [
        "views/pos_config.xml",
        "views/stock_production_lot.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_lot_base/static/src/js/**/*.js",
        ],
    },
}
