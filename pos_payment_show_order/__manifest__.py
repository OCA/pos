# Copyright (C) 2026-Today GRAP (http://www.grap.coop)
# @author Quentin DUPONT
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "POS Payment Show Order",
    "summary": "Improve POS Payment Screen by displaying order",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["quentinDupont"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": [
            "pos_payment_show_order/static/src/css/*.scss",
            "pos_payment_show_order/static/src/xml/**.xml",
        ],
    },
    "installable": True,
}
