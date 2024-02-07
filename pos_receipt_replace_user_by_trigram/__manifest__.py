# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Receipt Replace User By Trigram",
    "summary": "Replace User by Trigram in POS receipt.",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "version": "16.0.1.0.0",
    "depends": [
        "point_of_sale",
        "partner_firstname",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_receipt_replace_user_by_trigram/static/src/js/models.js",
            "pos_receipt_replace_user_by_trigram/static/src/js/order_receipt.js",
            "pos_receipt_replace_user_by_trigram/static/src/xml/**/*",
        ],
    },
    "data": [
        "views/res_config_settings.xml",
        "views/res_users.xml",
    ],
}
