# -*- coding: utf-8 -*-
# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Clear product search on click",
    'version': '9.0.0.0.1',
    'category': 'Point of Sale',
    'summary': 'Point of Sale - Clear product search when user clicks on a product.',
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "http://www.lenid.ch",
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/templates.xml',
    ],
    'installable': True,
}
