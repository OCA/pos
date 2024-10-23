# Copyright (C) 2024 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Customer Screen Partner Location Google Map",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Select partner location in POS on the customer screen Google map",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "pos_customer_screen_partner_location",
        "pos_partner_location_google_map",
    ],
    "data": [],
    "assets": {
        "web.assets_frontend": [
            "pos_customer_screen_partner_location_google_map/static/src/portal/*.js",
        ]
    },
    "installable": True,
    "auto_install": True,
}
