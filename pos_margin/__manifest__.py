# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Margin',
    'version': '11.0.1.0.1',
    'category': 'Point Of Sale',
    'sequence': 1,
    'author': "GRAP,"
              "Odoo Community Association (OCA)",
    'summary': 'Margin on PoS Order',
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/pos',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/view_pos_order.xml',
    ],
    'installable': True,
}
