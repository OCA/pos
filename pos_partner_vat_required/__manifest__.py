# Copyright 2024 Antoni Marroig(APSL-Nagarro)<amarroig@apsl.net>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Pos Partner Vat Required",
    "summary": "Put partner vat required in pos",
    "version": "17.0.1.0.0",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Antoni Marroig, APSL-Nagarro, Odoo Community Association (OCA)",
    "maintainers": ["peluko00"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_partner_vat_required/static/src/app/PartnerDetailsEdit.esm.js",
        ],
    },
}
