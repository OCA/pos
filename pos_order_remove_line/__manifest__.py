# Copyright 2019 LevelPrime
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

{
    'name': "POS Order Remove Line",
    'summary': "Add button to remove POS order line.",
    'author': "Roberto Fichera, Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/pos',
    'category': 'Point of Sale',
    "maintainers": ["robyf70"],
    'version': '12.0.1.1.1',
    'license': 'LGPL-3',
    'depends': ['point_of_sale'],
    'data': [
        'views/assets.xml'
    ],
    'qweb': [
        'static/src/xml/order_line.xml'
    ]
}
