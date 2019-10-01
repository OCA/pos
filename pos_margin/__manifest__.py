# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'PoS Order Margin',
    'summary': 'Margin on PoS Order',
    'version': '12.0.1.0.0',
    'category': 'Point Of Sale',
    'author': "GRAP,"
              "Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
        'sale_margin',
    ],
    'data': [
        'views/view_pos_order.xml',
    ],
    'installable': True,
}
