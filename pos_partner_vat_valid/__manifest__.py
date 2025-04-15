# Copyright 2025 APSL-Nagarro Antoni Marroig
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Pos Partner Vat Valid",
    "summary": "Validate partner vat in POS",
    "version": "17.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "APSL-Nagarro, Odoo Community Association (OCA)",
    "maintainers": ["peluko00"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
        "base_vat",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_partner_vat_valid/static/src/app/PartnerDetailsEdit.esm.js",
        ],
    },
}
