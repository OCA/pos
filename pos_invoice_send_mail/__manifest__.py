# Copyright 2019 Druidoo - Iván Todorovich
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    'name': 'POS Invoice Send by Mail',
    'summary': 'Send invoices by email from the POS',
    'version': '12.0.1.0.0',
    'category': 'Point of Sale',
    'author': 'Druidoo, '
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'maintainers': [
        'ivantodorovich',
    ],
    'depends': [
        'point_of_sale',
        'mail',
    ],
    'data': [
        'views/assets.xml',
        'views/pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
}
