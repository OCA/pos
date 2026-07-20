# Copyright (C) 2026-Today GRAP (http://www.grap.coop)
# @author Quentin DUPONT
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "POS Restaurant Split Order Usability",
    "summary": "Improve POS Split Screen by displaying already paid lines",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "maintainers": ["quentinDupont"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "depends": ["point_of_sale", "pos_restaurant"],
    "data": [
        "views/view_pos_order.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_restaurant_split_order_usability/static/src/css/*.scss",
            "pos_restaurant_split_order_usability/static/src/xml/**.xml",
            "pos_restaurant_split_order_usability/static/src/js/**.js",
        ],
    },
    "installable": True,
}
