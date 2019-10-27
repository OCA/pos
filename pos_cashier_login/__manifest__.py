# Copyright (C) 2019 by Lambda IS <https://www.lambda-is.com>
{
    'name': 'POS - Cashier login',
    'category': 'Point Of Sale',
    'author': 'Lambda IS, '
              'Odoo Community Association (OCA)',
    'website': 'https://odoo-community.org/',
    'license': 'AGPL-3',
    'summary': 'Require for cashier to sign in before each sale',
    'version': '11.0.0.1.0',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/assets.xml',
        'views/pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/main.xml',
    ],
    'installable': True,
    'maintainers': [
        'kirca',
    ]
}
