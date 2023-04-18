# Copyright 2023 Emanuel Cino
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "Point of Sale - Partner contact birthdate",
    "summary": "Adds the birthdate in the customer screen of POS",
    "version": "16.0.1.0.1",
    "development_status": "Beta",
    "category": "Point of sale",
    "website": "https://github.com/OCA/pos",
    "author": "Emanuel Cino, Odoo Community Association (OCA)",
    "maintainers": ["ecino"],
    "license": "AGPL-3",
    "installable": True,
    "depends": ["point_of_sale", "partner_contact_birthdate"],
    "assets": {
        "point_of_sale.assets": [
            "pos_partner_birthdate/static/src/xml/ClientDetailsEdit.xml"
        ]
    },
}
