# -*- coding: utf-8 -*-
# This file is part of OpenERP. The COPYRIGHT file at the top level of
# this module contains the full copyright notices and license terms.

{
    'name': 'POS No Bank Statement',
    'version': '0.1',
    'author': 'Versada UAB',
    'category': 'Other',
    'website': 'http://www.versada.lt',
    'description': """
This module allows user make POS Payment Method (Account Journal) not to create
Bank Statement Lines. This also means that no Journal Entries is going to be
created. One possible usage of the module is when products are sold only by
issuing an Invoice without registering any payment.
    """,
    'depends': [
        'point_of_sale'
    ],
    'data': [
        'view/account.xml',
    ],
    'demo': ['demo.xml'],
    'installable': True,
    'application': False,
}
