# Copyright (C) 2023-Today: Aures Tic (<https://www.aurestic.es/>)
# @author: Jose Zambudio (https://twitter.com/zamberjo)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Return Voucher",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Point of Sale - Manage return vouchers",
    "author": "Aures Tic, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "development_status": "Alpha",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
        "stock",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/pos_return_voucher.xml",
        "views/pos_order.xml",
        "views/pos_config.xml",
        "views/pos_payment.xml",
        "views/pos_payment_method.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_return_voucher/static/src/js/**/*",
            "pos_return_voucher/static/src/xml/**/*",
        ],
    },
    "installable": True,
}
