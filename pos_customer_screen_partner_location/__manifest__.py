# Copyright (C) 2024 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Customer Screen Partner Location",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Select partner location in POS on the customer screen",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["pos_partner_location_abstract"],
    "data": [
        "views/customer_screen_template.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_customer_screen_partner_location/static/src/js/*.js",
            "pos_customer_screen_partner_location/static/src/xml/*.xml",
        ],
        "web.assets_tests": [],
        "web.assets_frontend": [
            "pos_customer_screen_partner_location/static/src/portal/*.js",
        ],
    },
    "installable": True,
}
