# -*- coding: utf-8 -*-
# © 2015 Akretion, GRAP, OCA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'POS Default empty image',
    'version': '10.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Optimize loading time for products without image',
    'author': "Akretion, GRAP, Odoo Community Association (OCA)",
    'website': "https://akretion.com",
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/pos_default_empty_image.xml',
    ],
    'installable': True,
}
