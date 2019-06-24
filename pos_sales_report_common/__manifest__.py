# Copyright 2019 Martronic SA (https://www.martronic.ch)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale and Sales Report',
    'version': '11.0.1.0.0',
    'category': 'Point Of Sale, Sale',
    'author': 'Martronic SA, '
              'Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'https://www.github.com/OCA/pos',
    'depends': [
        'sale',
        'stock',
        'point_of_sale',
    ],
    'data': [
        'security/ir.model.access.csv',
        'report/sale_report_views.xml',
        'views/product.xml',
        'views/sale_common.xml'
    ],
    'demo': [
    ],
    'installable': True,
}
