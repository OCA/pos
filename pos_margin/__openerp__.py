# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Margin',
    'version': '8.0.1.0.1',
    'category': 'Point Of Sale',
    'author': "GRAP,"
              "Odoo Community Association (OCA)",
    'summary': 'Margin on PoS Orders',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/view_pos_order.xml',
        'data/decimal_precision.xml',
    ],
    'installable': True,
    'pre_init_hook': 'pre_init_hook',
}
