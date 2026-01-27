# Copyright (C) 2024-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point of Sale Restaurant - Receipt Usability",
    "summary": "Improve receipt screen in the PoS Restaurant front office",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "maintainers": ["legalsylvain"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["pos_restaurant", "pos_receipt_usability"],
    "assets": {
        "point_of_sale.assets": [
            "pos_restaurant_receipt_usability/static/src/**/*.scss",
            "pos_restaurant_receipt_usability/static/src/**/*.xml",
            "pos_restaurant_receipt_usability/static/src/**/*.js",
        ],
    },
    "installable": True,
}
