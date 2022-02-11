# -*- coding: utf-8 -*-
{
    'name': 'Pos Orders',
    'version': '12.0.1.0.0',
    'summary': """Previous Orders in POS Screen""",
    'description': """Orders in pos screen""",
    'category': 'Point of Sale',
    'author': 'Luiz Felipe do Divino',
    'company': 'Kmee',
    'maintainer': 'Kmee',
    'support': 'luiz.divino@kmee.com.br',
    'website': "",
    'depends': ['point_of_sale'],
    'data': [
        'views/templates.xml'
    ],
    'images': [],
    'qweb': [
        'static/src/xml/pos_order.xml',
    ],
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
