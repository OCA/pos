# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Partner Sale Warnings",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Show partner sales warning in POS",
    "depends": ["sale_management", "point_of_sale"],
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "data": [],
    "assets": {
        "point_of_sale.assets": [
            "pos_partner_sale_warning/static/src/js/*.esm.js",
        ],
        "web.assets_tests": [
            "pos_partner_sale_warning/static/src/tests/tours/PosPartnerSaleWarning.esm.tour.js",
        ],
    },
    "installable": True,
}
