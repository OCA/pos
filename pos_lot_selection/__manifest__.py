# Copyright 2018 Tecnativa S.L. - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Lot Selection',
    'version': '11.0.1.0.0',
    'category': 'Point of Sale',
    'author': 'Tecnativa,'
              'Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'templates/assets.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'application': False,
    'installable': True,
}
