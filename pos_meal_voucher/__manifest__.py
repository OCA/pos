# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Point Of Sale - Meal Voucher",
    "summary": "Handle meal vouchers in Point of Sale"
    " with eligible amount and max amount",
    "version": "12.0.1.0.5",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "http://www.github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
    ],
    "data": [
        "data/barcode_rule.xml",
        "views/view_account_journal.xml",
        "views/view_pos_config.xml",
        "views/view_product_category.xml",
        "views/view_product_template.xml",
        "views/templates.xml",
    ],
    "qweb": [
        "static/src/xml/pos_meal_voucher.xml",
    ],
    "demo": [
        "demo/product_category.xml",
        "demo/product_product.xml",
    ],
    "installable": True,
}
