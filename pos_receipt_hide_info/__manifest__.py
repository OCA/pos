# Copyright 2024 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "POS Receipt Hide Information",
    "summary": "Removes Information from POS receipt.",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "version": "16.0.1.0.0",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": [
            "pos_receipt_hide_info/static/src/js/order_receipt.js",
            "pos_receipt_hide_info/static/src/xml/**/*",
        ],
    },
    "data": ["views/res_config_settings.xml"],
}
