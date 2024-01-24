# Copyright 2024 Dixmit
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Pos Partner Second Lastname",
    "summary": """
        Manage second last name inside Point Of Sale Frontend""",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "author": "Dixmit,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "depends": ["partner_second_lastname", "pos_partner_firstname"],
    "data": [],
    "demo": [],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_partner_second_lastname/static/src/app/PartnerDetailsEdit.esm.js",
            "pos_partner_second_lastname/static/src/app/PartnerDetailsEdit.xml",
        ],
    },
}
