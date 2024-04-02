# Copyright (C) 2023 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Partner Location Abstract",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "POS Partner Location Abstract",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["base_geolocalize", "point_of_sale"],
    "data": [],
    "assets": {
        "point_of_sale.assets": [
            "pos_partner_location_abstract/static/src/css/*.css",
            "pos_partner_location_abstract/static/src/js/*.js",
            "pos_partner_location_abstract/static/src/xml/*.xml",
        ],
        "web.assets_tests": [
            "pos_partner_location_abstract/static/src/tests/tours/*.tour.esm.js",  # noqa
        ],
    },
    "installable": True,
}
