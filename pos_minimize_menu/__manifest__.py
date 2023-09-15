# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point of Sale - Minimize Menu",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "summary": "Reduce size of the main menu of the point of sale.",
    "depends": ["point_of_sale"],
    "website": "https://github.com/OCA/pos",
    "author": "GRAP,Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "demo": [
        "demo/pos_config.xml",
    ],
    "data": [
        "views/view_res_config_settings.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_minimize_menu/static/src/js/ProductScreen.js",
            "pos_minimize_menu/static/src/xml/ProductScreen.xml",
        ],
    },
    "license": "LGPL-3",
}
