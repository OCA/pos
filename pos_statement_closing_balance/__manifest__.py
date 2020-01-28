# Copyright 2020 ForgeFlow, S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Statement Closing Balance',
    'version': '12.0.1.0.1',
    'category': 'Point Of Sale',
    'summary': 'Allows to set a closing balance in your statements and '
               'auto-post the difference between theoretical and actual.',
    'author': 'ForgeFlow, Odoo Community Association (OCA)',
    'website': 'http://www.github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'pos_cash_box_journal',
    ],
    'data': [
        'wizards/pos_update_statement_closing_balance.xml',
        'views/pos_session_views.xml',
        'views/account_journal_views.xml',
    ],
    'installable': True,
}
