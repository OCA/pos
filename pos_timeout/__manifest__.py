# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# Copyright (C) 2017 - Today: Akretion (http://www.akretion.com)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point of Sale - timeout",
    "summary": "Set the timeout of the point of sale",
    "version": "16.0.1.0.0",
    "category": "Sales/Point Of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "GRAP, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "images": ["static/description/pos_config.png"],
    "data": [
        "views/res_config_settings.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_timeout/static/src/js/models.js",
        ],
    },
    "installable": True,
}
