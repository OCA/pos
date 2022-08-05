# Copyright (C) 2018 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'Point of Sale - Load Picking by Partner Name improvment',
    'summary': "Improve load of picking in PoS by partner name",
    'version': '12.0.1.0.2',
    'category': 'Point of Sale',
    'author': 'GRAP,Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'maintainers': ['legalsylvain'],
    'development_status': 'Beta',
    'depends': [
        'pos_picking_load',
    ],
    'pre_init_hook': 'pre_init_hook',
    'installable': True,
}
