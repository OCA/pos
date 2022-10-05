# Copyright 2021 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Progressive web application",
    "summary": "Make Odoo POS a PWA",
    "version": "14.0.1.0.0",
    "development_status": "Beta",
    "category": "Website",
    "website": "https://github.com/OCA/pos",
    "author": "KMEE, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": True,
    "installable": True,
    "depends": [
        "point_of_sale",
        "web",
        "mail",
    ],
    "data": [
        "templates/assets.xml",
        "views/res_config_settings_views.xml",
    ],
    "images": ["static/description/pwa.png"],
}
