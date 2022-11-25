# Copyright 2020 Lorenzo Battistini @ TAKOBI
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
{
    "name": "Point of Sale Fixed Discounts",
    "summary": "Allow to apply discounts with fixed amount",
    "version": "15.0.1.0.1",
    "development_status": "Beta",
    "category": "Point of Sale",
    "website": "https://github.com/OCA/pos",
    "author": "TAKOBI, Odoo Community Association (OCA)",
    "maintainers": ["eLBati"],
    "license": "LGPL-3",
    "application": False,
    "installable": True,
    "depends": ["pos_discount"],
    "assets": {
        "point_of_sale.assets": [
            "pos_fixed_discount/static/src/js/FixedDiscountButton.js",
        ],
        "web.assets_qweb": [
            "pos_fixed_discount/static/src/xml/**/*",
        ],
    },
}
