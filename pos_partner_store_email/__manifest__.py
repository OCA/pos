# Copyright 2026 Daniel Reis
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of Sale - Store email on the customer",
    "summary": "Store the email entered on the POS receipt screen on the customer",
    "version": "19.0.1.0.0",
    "development_status": "Beta",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Daniel Reis, Odoo Community Association (OCA)",
    "maintainers": ["dreispt"],
    "license": "LGPL-3",
    "installable": True,
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_partner_store_email/static/src/js/*.js",
            "pos_partner_store_email/static/src/xml/*.xml",
        ],
    },
}
