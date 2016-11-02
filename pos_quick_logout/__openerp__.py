# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


{
    'name': 'Point of Sale - Quick Logout',
    'version': '9.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Allow PoS user to logout quickly after user changed',
    'author': 'La Louve, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'static/src/xml/templates.xml',
    ],
    'qweb': [
        'static/src/xml/pos_quick_logout.xml',
    ],
    'installable': True,
}
