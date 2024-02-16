# Copyright 2021 initOS Gmbh
# Copyright 2019 Roberto Fichera
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Partner Firstname",
    "summary": "POS Support of partner firstname",
    "version": "17.0.1.0.1",
    "development_status": "Beta",
    "category": "Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "Roberto Fichera, Odoo Community Association (OCA)",
    "maintainers": ["robyf70"],
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "auto_install": True,
    "depends": [
        "point_of_sale",
        "partner_firstname",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_partner_firstname/static/src/app/PartnerDetailsEdit.esm.js",
            "pos_partner_firstname/static/src/app/PartnerDetailsEdit.xml",
            "pos_partner_firstname/static/src/app/PartnerDetailsEdit.scss",
        ],
    },
}
