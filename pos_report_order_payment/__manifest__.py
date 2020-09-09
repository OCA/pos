# Copyright 2020 Iván Todorovich <ivan.todorovich@gmail.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    'name': 'Point of Sale Payment Report',
    'summary': 'Analyze point of sale payments',
    'category': 'Point of Sale',
    'version': '12.0.1.0.0',
    'author': 'Druidoo, '
              'Moka Tourisme, '
              'Odoo Community Association (OCA)',
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/pos',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'security/ir.model.access.csv',
        'report/pos_order_payment_report.xml',
    ],
}
