# Copyright 2022 Coop IT Easy SC
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale Automatically Invoice",
    "summary": "Allow to set POS orders as to-invoice by default",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Coop IT Easy SC, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/res_config_settings_view.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_auto_invoice/static/src/js/*.js",
        ]
    },
}
