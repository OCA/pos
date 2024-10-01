# Copyright 2024 Camptocamp (https://www.camptocamp.com).
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Partner Pricelist Load Background",
    "summary": "Pos ",
    "version": "16.0.1.0.0",
    "author": "Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "category": "Point of Sale",
    "depends": ["point_of_sale"],
    "installable": True,
    "assets": {
        "point_of_sale.assets": [
            "pos_partner_pricelist_load_background/static/src/js/**/*.js",
        ],
    },
}
