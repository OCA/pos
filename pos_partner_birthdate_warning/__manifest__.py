# Copyright 2025 Invitu SARL
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
{
    "name": "POS Partner Birthdate Warning",
    "summary": "Display customer's age in POS interface according to the age setting",
    "version": "17.0.0.1.0",
    "category": "Point of sale",
    "website": "https://github.com/OCA/pos",
    "author": "Invitu, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "installable": True,
    "depends": ["pos_partner_birthdate"],
    "data": [
        "views/res_config_settings.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_partner_birthdate_warning/static/src/xml/actionpad_widget.xml",
            "pos_partner_birthdate_warning/static/src/js/PartnerListScreen.esm.js",
            "pos_partner_birthdate_warning/static/src/js/pos_store.esm.js",
        ]
    },
}
