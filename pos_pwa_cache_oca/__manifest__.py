# Copyright 2021 KMEE
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Progressive web application Cache",
    "summary": "Make Odoo POS a PWA Cache",
    "version": "14.0.1.0.0",
    "development_status": "Beta",
    "category": "Website",
    "website": "https://github.com/OCA/pos",
    "author": "KMEE, Odoo Community Association (OCA)",
    "license": "LGPL-3",
    "application": True,
    "installable": True,
    "depends": [
        'pos_pwa_oca'
    ],
    "data": [
        "templates/assets.xml",
    ],
    'images': ['static/description/pwa.png'],
}
