# -*- coding: utf-8 -*-
# © 2016 KMEE INFORMATICA LTDA (https://kmee.com.br)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Order Picking Link',
    'version': '8.0.1.1.0',
    'category': 'Point of Sale',
    'summary': 'Adds link between Pos orders and generated pickings',
    'author': 'KMEE INFORMATICA LTDA, Odoo Community Association (OCA)',
    'website': 'http://www.kmee.com.br',
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'data': [
        'views/stock_view.xml',
    ],
    'installable': True,
}
