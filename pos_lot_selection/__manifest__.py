# Copyright 2018 Tecnativa S.L. - David Vidal
# Copyright 2022 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Lot Selection",
    "version": "17.0.1.0.0",
    "category": "Point of Sale",
    "author": "Tecnativa, Camptocamp, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_lot_selection/static/src/js/**/*.js",
            "pos_lot_selection/static/src/xml/**/*.xml",
        ],
        "web.assets_tests": [
            "pos_lot_selection/static/tests/tours/**/*",
        ],
    },
    "application": False,
    "installable": True,
}
