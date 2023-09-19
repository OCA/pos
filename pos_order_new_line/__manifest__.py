# Copyright (C) 2023-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point of Sale - New Line",
    "summary": "Allow cashier to create a new order line, instead of"
    " merging the quantity with a previous line",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "maintainers": ["legalsylvain"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale.assets": [
            "pos_order_new_line/static/src/js/OrderLine.esm.js",
            "pos_order_new_line/static/src/js/Order.esm.js",
            "pos_order_new_line/static/src/js/NewlineButton.esm.js",
            "pos_order_new_line/static/src/xml/NewlineButton.xml",
        ],
    },
    "installable": True,
}
