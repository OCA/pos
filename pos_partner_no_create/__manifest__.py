# Copyright 2017 - 2020 BEES coop SCRLfs
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
{
    "name": "POS - Forbid New Customer Creation",
    "summary": """Forbid customer creation from the POS""",
    "author": "Odoo Community Association (OCA),"
    " BEES coop - Cellule IT,"
    " Coop IT Easy SC",
    "website": "https://github.com/OCA/pos",
    "category": "Point Of Sale",
    "version": "16.0.1.0.0",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": [
            "pos_partner_no_create/static/src/xml/PartnerListScreen.xml",
        ],
    },
    "installable": True,
    "license": "AGPL-3",
}
