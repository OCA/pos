# Copyright 2014-2020 Aurélien DUMAINE
# Copyright 2014-2020 Akretion France (http://www.akretion.com/)
# @author: Alexis de Lattre <alexis.delattre@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Point of Sale - LED Customer Display",
    "version": "15.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Manage LED Customer Display device from POS front end",
    "author": "Aurélien DUMAINE,GRAP,Akretion,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "data": [
        "views/view_pos_config.xml",
    ],
    "demo": ["demo/pos_config.xml"],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_customer_display/static/src/js/models.js",
            "pos_customer_display/static/src/js/payment_screen.js",
            "pos_customer_display/static/src/js/product_screen.js",
            "pos_customer_display/static/src/js/chrome.js",
            "pos_customer_display/static/src/js/devices.js",
            "pos_customer_display/static/src/js/customer_display_2_20.js",
        ],
    },
}
