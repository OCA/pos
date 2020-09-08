# Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale - Disable Change Cashier',
    'version': '12.0.1.0.1',
    'category': 'Point Of Sale',
    'summary': 'Disable the feature that allow to change cashier in the PoS',
    'author': 'GRAP, Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'views/assets.xml',
        'views/pos_config.xml',
    ],
}
