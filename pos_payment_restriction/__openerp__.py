# -*- coding: utf-8 -*-
# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Pos Payment Restriction',
    'summary': """
        Adds restrictions options on POS payment level""",
    'version': '9.0.1.0.0',
    'license': 'AGPL-3',
    'development_status': 'Beta',
    'maintainers': ['rousseldenis'],
    'category': 'Point of Sale',
    'author': 'ACSONE SA/NV,Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/pos_config.xml',
        'views/pos_payment_restriction.xml',
    ],
}
