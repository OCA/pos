# Copyright 2019 Xtendoo (http://www.xtendoo.es)
# Copyright 2019 Manuel Calero Solís
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Pos Combinated Drinks',
    'version': '13.0.1.0.0',
    'category': 'Point of Sale',
    'author': 'Xtendoo',
    'website': 'https://www.xtendoo.es',
    'license': 'AGPL-3',
    'summary': 'This module allows to use combined drinks in a bar or restaurant',
    'version': '1.0.1',
    'depends': ['base', 'pos_restaurant'],
    "data": [
        'security/ir.model.access.csv',
        'views/point_of_sale.xml',
        'views/pos_combined_drinks.xml',
    ],
    'qweb': ['static/src/xml/pos.xml'],
    'installable': True,
    'auto_install': False,
}
