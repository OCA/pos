# -*- coding: utf-8 -*-
# Copyright 2015 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "POS payment entries globalization",

    'summary': """
        Globalize POS Payment""",
    'author': 'ACSONE SA/NV,'
              'Odoo Community Association (OCA)',
    'website': "http://acsone.eu",
    'category': 'Point Of Sale',
    'version': '8.0.1.0.0',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/account_journal_view.xml',
    ],
}
