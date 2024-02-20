# Copyright (C) 2024 Cetmix OÜ
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "POS Screen Elements Custom Size",
    "version": "16.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Set custom size for POS screen elements",
    "license": "AGPL-3",
    "website": "https://github.com/OCA/pos",
    "author": "Cetmix, Odoo Community Association (OCA)",
    "depends": ["point_of_sale"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    "images": [],
    "assets": {
        "point_of_sale.assets": [
            "pos_screen_element_custom_size/static/src/xml/*.xml",
        ],
    },
    "installable": True,
}
