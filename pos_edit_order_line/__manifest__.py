# copyright 2022 Dinar Gabbasov
# Copyright 2022 Ooops404
# Copyright 2022 Cetmix
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    "name": "POS Edit Order Line",
    "version": "16.0.1.0.1",
    "summary": "POS Edit Order Line",
    "author": "Ooops, Cetmix, Odoo Community Association (OCA)",
    "contributors": "Cetmix",
    "license": "LGPL-3",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "depends": ["point_of_sale"],
    "external_dependencies": {},
    "demo": [],
    "images": ["static/description/banner.png"],
    "data": ["views/res_config_settings_view.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_edit_order_line/static/src/css/pos.css",
            "pos_edit_order_line/static/src/js/*.js",
            "pos_edit_order_line/static/src/xml/*.xml",
        ],
    },
    "installable": True,
    "application": False,
}
