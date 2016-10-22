# -*- coding: utf-8 -*-
# © 2014-2016 Aurélien DUMAINE
# © 2014-2016 Akretion (Alexis de Lattre <alexis.delattre@akretion.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'POS Customer Display',
    'version': '10.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Manage Customer Display device from POS front end',
    'author': "Aurélien DUMAINE,Akretion,Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_customer_display.xml',
        'views/customer_display_view.xml',
        ],
    'demo': ['demo/pos_customer_display_demo.xml'],
    'installable': True,
}
