# Copyright (C) 2015 Mathieu VATEL <mathieu@julius.fr>
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Mathieu VATEL <mathieu@julius.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "POS Automatic Validation",
    "version": "18.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "Manage Automatic Validation after complete "
    "payment in the POS front end",
    "author": "Julius Network Solutions, Druidoo, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": ["point_of_sale"],
    "data": [
        "views/pos_payment_method_view.xml",
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_automatic_validation/static/src/js/pos_order_auto_validate.esm.js",
            "pos_automatic_validation/static/src/js/pos_order.esm.js",
            "pos_automatic_validation/static/src/xml/payment_screen.xml",
        ],
        "web.assets_tests": [
            "pos_automatic_validation/static/tests/pos_auto_validate_test.esm.js",
        ],
    },
    "installable": True,
}
