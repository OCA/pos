# Copyright 2015-2017 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "POS payment entries globalization",
    'summary': """Globalize POS Payment""",
    'author': 'ACSONE SA/NV,'
              'Odoo Community Association (OCA)',
    'website': "https://github.com/OCA/pos",
    'category': 'Point Of Sale',
    'version': '11.0.1.0.1',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/account_journal_view.xml',
    ],
    'installable': True,
}
