# Copyright 2022 - Today Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - Cashback Warning",
    "version": "12.0.1.0.1",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["legalsylvain"],
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "views/templates.xml",
    ],
    "qweb": [
        'static/src/xml/pos.xml',
    ],
    "images": [
        "static/description/pos_cashback_warning.png",
    ],
    "installable": True,
}
