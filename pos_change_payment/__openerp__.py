# coding: utf-8
# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Point Of Sale - Payments Change',
    'version': '8.0.1.0.0',
    'category': 'Point Of Sale',
    'author': 'GRAP',
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/action.xml',
        'views/view_account_bank_statement.xml',
        'views/view_pos_change_payments_wizard.xml',
        'views/view_pos_order.xml',
        'views/view_pos_switch_journal_wizard.xml',
    ],
    'installable': True,
}
