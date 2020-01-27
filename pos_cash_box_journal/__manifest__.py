# Copyright 2020 Creu Blanca
# Copyright 2020 ForgeFlow, S.L.
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

{
    'name': 'POS Cash Box Journal',
    'version': '12.0.1.0.1',
    'category': 'Point Of Sale',
    'summary': 'Allow to define a journal and account to use when '
               'you take money in / out',
    'author': 'Creu Blanca, ForgeFlow, Odoo Community Association (OCA)',
    'website': 'http://www.github.com/OCA/pos',
    'license': 'LGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'wizards/cash_box_journal_in.xml',
        'wizards/cash_box_journal_out.xml',
        'views/pos_session_views.xml',
    ],
    'installable': True,
}
