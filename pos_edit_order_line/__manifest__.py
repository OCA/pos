# copyright 2022 Dinar Gabbasov
# Copyright 2022 Ooops404
# Copyright 2022 Cetmix
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Edit Order Line",
    "version": "14.0.1.0.0",
    "summary": "POS Edit Order Line",
    "author": "Ooops, Cetmix, Odoo Community Association (OCA)",
    "contributors": "Cetmix",
    "license": "LGPL-3",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "external_dependencies": {},
    "demo": [],
    "data": ["views/assets.xml", "views/pos_config_view.xml"],
    "qweb": [
        "static/src/xml/EditOrderButton.xml",
        "static/src/xml/EditOrderPopup.xml",
        "static/src/xml/EditOrderLineInput.xml",
    ],
    "installable": True,
    "application": False,
}
