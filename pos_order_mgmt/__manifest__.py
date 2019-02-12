# Copyright 2018 GRAP - Sylvain LE GAL
# Copyright 2018 Tecnativa S.L. - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Frontend Orders Management',
    'summary': 'Manage old POS Orders from the frontend',
    'version': '11.0.1.0.1',
    'category': 'Point of Sale',
    'author': 'GRAP, '
              'Tecnativa, '
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'pos_order_return',
    ],
    'data': [
        'views/assets.xml',
        'views/view_pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'application': False,
    'installable': True,
}
