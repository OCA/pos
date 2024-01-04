# Copyright 2023 INVITU
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Point of Sale - Partner contact ref",
    "summary": "Adds the partner ref in the customer screen of POS",
    "version": "17.0.1.0.0",
    "development_status": "Beta",
    "category": "Point of sale",
    "website": "https://github.com/OCA/pos",
    "author": "INVITU, Odoo Community Association (OCA)",
    "maintainers": ["invitu"],
    "license": "AGPL-3",
    "installable": True,
    "depends": [
        "point_of_sale",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_partner_ref/static/src/xml/screens.xml",
            "pos_partner_ref/static/src/js/ClientDetailsEdit.esm.js",
            "pos_partner_ref/static/src/js/PosDB.esm.js",
        ]
    },
}
