# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Partner Location Google Map",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "POS Partner Location Google Map",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["pos_partner_location_abstract"],
    "data": [],
    "assets": {
        "point_of_sale.assets": [
            "pos_partner_location_google_map/static/src/js/*.js",
        ],
    },
    "installable": True,
}
