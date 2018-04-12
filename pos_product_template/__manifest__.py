# -*- encoding: utf-8 -*-
{
    'name': 'POS - Product Template',
    'version': '10.0.1.0.1',
    'category': 'Point Of Sale',
    'author': "Akretion,Odoo Community Association (OCA)",
    'summary': 'Manage Product Template in Front End Point Of Sale',
    'website': 'http://www.akretion.com',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'view/view.xml',
    ],
    'qweb': [
        'static/src/xml/ppt.xml',
    ],
    'demo': [
        'demo/product_attribute_value.yml',
        'demo/product_product.yml',
        'demo/res_groups.yml',
    ],
    'images': [
        'static/src/img/screenshots/pos_product_template.png',
    ],
    'installable': True,
}
