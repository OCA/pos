# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'PoS Order To Sale Order',
    'version': '8.0.2.0.0',
    'author': 'GRAP,Odoo Community Association (OCA)',
    'category': 'Point Of Sale',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'website': 'https://odoo-community.org/',
    'data': [
        'views/view_pos_config.xml',
        'views/pos_order_to_sale_order.xml',
    ],
    'demo': [
        'demo/res_groups.xml',
    ],
    'qweb': [
        'static/src/xml/pos_order_to_sale_order.xml',
    ],
}
