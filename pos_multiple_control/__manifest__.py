# Copyright (C) 2013 - Today: GRAP (http://www.grap.coop)
# @author Julien WESTE
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# @author: Quentin DUPONT (https://twitter.com/pondupont)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "Point Of Sale - Multiple Cash Control",
    "summary": "Allow user to control each statement and add extra checks",
    "version": "12.0.1.3.1",
    "category": "Point of Sale",
    "author": "GRAP, Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/pos",
    "license": "AGPL-3",
    "depends": [
        "point_of_sale",
        "pos_cash_move_reason"
    ],
    "data": [
        "views/view_account_bank_statement_cashbox.xml",
        "views/view_account_journal.xml",
        "views/view_pos_config.xml",
        "views/view_pos_session.xml",
        "wizard/wizard_pos_update_statement_balance.xml",
    ],
    'demo': [
        'demo/res_groups.xml',
        'demo/account_account.xml',
        'demo/account_bank_statement_cashbox.xml',
        'demo/account_journal.xml',
        'demo/pos_move_reason.xml',
        'demo/pos_config.xml',
    ],
    "installable": True,
}
