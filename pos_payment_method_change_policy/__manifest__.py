# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "PoS Order - Change Policy",
    "summary": "Adds alternative way to handle Change in Point of Sale.",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "author": "GRAP,Odoo Community Association (OCA)",
    "maintainers": ["legalsylvain"],
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": ["views/view_pos_payment_method.xml"],
    "demo": ["demo/product_product.xml"],
    "assets": {
        "point_of_sale.assets": [
            "pos_payment_method_change_policy/static/src/xml/PaymentScreen.xml",
            "pos_payment_method_change_policy/static/src/scss/style.scss",
            "pos_payment_method_change_policy/static/src/js/models.esm.js",
            "pos_payment_method_change_policy/static/src/js/PaymentScreen.esm.js",
        ],
    },
    "installable": True,
}
