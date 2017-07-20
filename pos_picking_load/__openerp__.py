# -*- coding: utf-8 -*-
# Copyright (C) 2017 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Picking Load',
    'version': '8.0.1.1.0',
    'author': 'GRAP,Odoo Community Association (OCA)',
    'category': 'Point Of Sale',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'website': 'https://odoo-community.org/',
    'data': [
        'views/view_pos_config.xml',
        'views/view_sale_order.xml',
        'views/view_stock_picking.xml',
        'views/view_stock_picking_type.xml',
        'views/pos_picking_load.xml',
    ],
    'demo': [
        'demo/res_groups.xml',
        'demo/product_template.xml',
        'demo/sale_order.xml',
        'demo/stock_picking_type.xml',
    ],
    'qweb': [
        'static/src/xml/pos_picking_load.xml',
    ],
}
