# Copyright 2026 Jarsa
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Settle Due Deposit Money",
    "version": "19.0.1.0.0",
    "summary": "Keep the Deposit money option available "
    "when the customer has due amounts",
    "author": "Jarsa, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "depends": ["pos_settle_due"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_settle_due_deposit_money/static/src/**/*",
        ],
        "web.assets_tests": [
            "pos_settle_due_deposit_money/static/tests/tours/**/*",
        ],
    },
    "installable": True,
}
