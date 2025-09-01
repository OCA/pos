# Copyright 2025 Bernat Obrador (APSL-Nagarro)<borbador@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Pos Open CashBox After Payment",
    "summary": "Allways Open the cashbox when a payment is made",
    "version": "17.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "APSL-Nagarro, Odoo Community Association (OCA)",
    "maintainers": ["BernatObrador"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_open_cashbox_after_payment/static/src/js/payment_screen.esm.js",
        ],
    },
}
