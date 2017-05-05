# -*- coding: utf-8 -*-
# Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale - Empty Home',
    'version': '9.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Hide products at the start of the Point of Sale',
    'author': 'La Louve, GRAP, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net/',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'static/src/xml/templates.xml',
    ],
    'qweb': [
        'static/src/xml/pos_empty_home.xml',
    ],
    'installable': True,
}
