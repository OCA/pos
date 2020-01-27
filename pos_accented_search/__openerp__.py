# -*- coding: utf-8 -*-
# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Accented Product Search",
    'version': '9.0.0.0.2',
    'category': 'Point of Sale',
    'summary': 'Point of Sale - Product search works regardless of accented characters',
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/pos",
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/templates.xml',
    ],
    'installable': True,
}
