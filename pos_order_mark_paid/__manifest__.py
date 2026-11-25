# Copyright 2026 Cetmix OÜ
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Order Mark Paid",
    "summary": "Mark POS order as paid, write off the residual amount",
    "version": "17.0.1.0.0",
    "category": "Sales/Point of Sale",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_order_views.xml",
        "views/report_saledetails.xml",
        "views/res_config_settings_views.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_order_mark_paid/static/src/**/*",
        ],
        "web.assets_tests": [
            "pos_order_mark_paid/static/tests/tours/**/*",
        ],
    },
    "installable": True,
}
