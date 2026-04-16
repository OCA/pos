# -*- coding: utf-8 -*-
# Copyright 2026 CHEF PIXEL
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0)

{
    "name": "POS Payment Force Done Confirmation",
    "version": "19.0.0.0",
    "category": "Point of Sale",
    "summary": "Ask for confirmation before marking a terminal payment as done.",
    "author": "CHEF PIXEL",
    "website": "https://github.com/OCA/pos",
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_payment_force_done_confirm/static/src/app/screens/payment_screen/payment_screen.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}

