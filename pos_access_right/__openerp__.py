# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale - Extra Access Right',
    'version': '9.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Point of Sale - Extra Access Right for certain actions',
    'author': 'La Louve, GRAP, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net/',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'security/res_groups.yml',
        'static/src/xml/templates.xml',
    ],
    'demo': [
        'demo/res_groups.yml',
    ],
    'installable': True,
}
