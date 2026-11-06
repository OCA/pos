# Copyright 2026 Aurestic (https://www.aurestic.es) - Antonio Valdés
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS Loyalty Card Fixed Expiration Date",
    "summary": "Apply the gift card fixed duration to gift cards sold in the PoS",
    "version": "18.0.1.0.0",
    "development_status": "Beta",
    "category": "POS",
    "author": "Aurestic, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "pos_loyalty",
        "loyalty_card_fixed_expiration_date",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_loyalty_card_fixed_expiration_date/static/src/js/**/*",
        ],
    },
}
