# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point of Sale - Membership Extension",
    "summary": "Prevent to sale product in the point of sale"
    " to customer that don't belong to membership categories",
    "version": "16.0.1.0.0",
    "category": "Point of Sale",
    "maintainers": ["legalsylvain"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale", "membership_extension"],
    "assets": {
        "point_of_sale.assets": [
            "pos_membership_extension/static/src/css/pos.css",
            "pos_membership_extension/static/src/js/ProductItem.js",
            "pos_membership_extension/static/src/js/ProductScreen.js",
            "pos_membership_extension/static/src/js/models.js",
            "pos_membership_extension/static/src/xml/ProductItem.xml",
            "pos_membership_extension/static/src/xml/ProductInfoPopup.xml",
        ],
    },
    "data": [
        "views/view_product_template.xml",
    ],
    "demo": [
        "demo/product_product.xml",
    ],
    "installable": True,
}
