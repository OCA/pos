# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Point of Sale - Note Field',
    'summary': "Store Order Line Note field in Database",
    'version': '12.0.1.0.3',
    'category': 'Point of Sale',
    'author': 'GRAP,Odoo Community Association (OCA)',
    'maintainers': ['legalsylvain'],
    'website': 'http://www.github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'pos_restaurant',
    ],
    'data': [
        'views/view_pos_order.xml',
    ],
}
