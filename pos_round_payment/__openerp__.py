# -*- coding: utf-8 -*-
# Copyright 2019 Jacques-Etienne Baudoux (BCIM sprl) <je@bcim.be>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': "POS Round Payment",
    'version': '1.0',
    'category': 'Point Of Sale',
    'author': "BCIM",
    'website': "https://www.bcim.be",
    'depends': [
        'point_of_sale',
        ],
    'data': [
        'views/account_journal.xml',
        'reports/pos_receipt.xml',
        ],
    'installable': True,
    'auto_install': False,
    'license': 'AGPL-3',
}
