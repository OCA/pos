# Copyright 2026 INVITU (https://www.invitu.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS Kitchen Receipt Reprint",
    "summary": "Reprint the kitchen receipt of an order from the Point of Sale",
    "version": "18.0.1.0.0",
    "category": "Sales/Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "INVITU, Odoo Community Association (OCA)",
    "maintainers": ["cvinh"],
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_kitchen_receipt_reprint/static/src/**/*",
        ],
        "web.assets_tests": [
            "pos_kitchen_receipt_reprint/static/tests/tours/**/*",
        ],
    },
}
