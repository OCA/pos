# copyright 2022 Dinar Gabbasov
# Copyright 2022 Ooops404
# Copyright 2022 Cetmix
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Edit Order Line",
    "version": "16.0.1.0.0",
    "summary": "POS Edit Order Line",
    "author": "Ooops, Cetmix, Odoo Community Association (OCA)",
    "contributors": "Cetmix",
    "license": "LGPL-3",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "external_dependencies": {},
    "demo": [],
    "data": ["views/pos_config_view.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_edit_order_line/static/src/css/pos.css",
            "pos_edit_order_line/static/src/js/EditOrderButton.js",
            "pos_edit_order_line/static/src/js/EditOrderPopup.js",
            "pos_edit_order_line/static/src/js/EditOrderLineInput.js",
            "pos_edit_order_line/static/src/xml/EditOrderButton.xml",
            "pos_edit_order_line/static/src/xml/EditOrderPopup.xml",
            "pos_edit_order_line/static/src/xml/EditOrderLineInput.xml",
        ],
    },
    "installable": True,
    "application": False,
}
