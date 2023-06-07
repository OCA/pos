# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'PoS Order Margin Accounting Role',
    'summary': 'Margin on PoS Order for Accounting Role',
    'version': '12.0.1.0.0',
    'category': 'Point Of Sale',
    'author': "Jumeldi - PT Solusi Aglis Indonesia,"
              "Odoo Community Association (OCA)",
    "maintainers": ["jumeldi74"],
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'pos_margin',
    ],
    'data': [
        'views/view_pos_order.xml',
    ],
    'installable': True,
}
