# Copyright (C) 2022-Today GRAP (http://www.grap.coop)
# @author Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3 - See http://www.gnu.org/licenses/agpl-3.0.html

{
    "name": "Point of Sale - Display All Discounts",
    "summary": "Display discount amount on PoS cashier screen and print it on ticket"
    "calculated from the difference between a sale with default pricelist",
    "version": "16.0.1.0.1",
    "category": "Point of Sale",
    "maintainers": ["legalsylvain"],
    "author": "GRAP,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/view_product_template.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "pos_discount_all/static/src/js/models.js",
            "pos_discount_all/static/src/xml/OrderSummary.xml",
        ],
        "web.assets_tests": [
            "pos_discount_all/tests/tours/PosDiscountAllTour.tour.js",
        ],
    },
    "demo": [
        "demo/product_product.xml",
        "demo/res_groups.xml",
    ],
    "installable": True,
}
