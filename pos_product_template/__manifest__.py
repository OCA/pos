{
    'name': 'POS - Product Template',
    'version': '12.0.1.0.1',
    'category': 'Point Of Sale',
    'author': "Akretion,Odoo Community Association (OCA)",
    'summary': 'Manage Product Template in Front End Point Of Sale',
    'website': 'http://www.akretion.com',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
        'pos_fix_search_limit',
    ],
    'data': [
        'view/view.xml',
    ],
    'qweb': [
        'static/src/xml/ppt.xml',
    ],
    'demo': [
        'demo/product_attribute_value.xml',
        'demo/product_product.xml',
    ],
    'images': [
        'static/src/img/screenshots/pos_product_template.png',
    ],
    'installable': True,
}
