# Copyright 2019 Roberto Fichera
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "POS Partner Firstname",
    "summary": "POS Support of partner firstname",
    "version": "12.0.1.1.1",
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
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'data': [
        'views/assets.xml',
    ],
}
