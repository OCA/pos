# Copyright 2026 Cetmix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS Multi Currency",
    "summary": "Take Point of Sale payments in foreign currencies",
    "version": "17.0.1.0.0",
    "category": "Sales/Point of Sale",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "security/ir.model.access.csv",
        "security/pos_multi_currency_security.xml",
        "views/res_config_settings_views.xml",
        "views/pos_payment_method_views.xml",
        "views/pos_payment_views.xml",
        "views/pos_order_views.xml",
        "views/pos_session_views.xml",
        "views/report_saledetails.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_multi_currency/static/src/app/**/*.js",
            "pos_multi_currency/static/src/app/**/*.xml",
        ],
        "web.assets_tests": [
            "pos_multi_currency/static/tests/tours/**/*.js",
        ],
    },
    "installable": True,
    "application": False,
}
