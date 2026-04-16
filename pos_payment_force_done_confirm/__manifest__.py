# -*- coding: utf-8 -*-
# Copyright 2026 CHEF PIXEL
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0)

{
    "name": "POS Payment Force Done Confirmation",
    "version": "19.0.0.0",
    "category": "Point of Sale",
    "summary": "Ask for confirmation before marking a terminal payment as done from the POS.",
    "description": """
        POS Payment Force Done Confirmation
        ===================================

        When a cashier uses **Force Done** on a payment line (typically card / terminal),
        this module shows a confirmation dialog to reduce mistakes that can desynchronize
        the point of sale with actual card capture.

        The primary action is to go back; confirming proceeds with **Force Done**.
    """,
    "author": "CHEF PIXEL",
    "website": "https://chef-pixel.fr",
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
