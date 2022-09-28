# Copyright 2019 LevelPrime
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

{
    "name": "POS Order Remove Line",
    "summary": "Add button to remove POS order line.",
    "author": "Roberto Fichera, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "category": "Point of Sale",
    "maintainers": ["robyf70"],
    'version': '0.1',
    "license": "LGPL-3",
    "depends": ["point_of_sale"],
    'assets': {
        'point_of_sale.assets': [
            '/pos_order_remove_line/static/src/css/orderline.scss',
            '/pos_order_remove_line/static/src/js/orderline.js',
        ],
        'web.assets_qweb': [
            '/pos_order_remove_line/static/src/xml/*',
        ],
    },
}
