# Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
# Copyright (C) 2019-Today: Druidoo (<https://www.druidoo.io>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale - Price to Weight',
    'version': '12.0.2.0.1',
    'category': 'Point Of Sale',
    'summary': 'Compute weight based on barcodes with prices',
    'author': 'La Louve, GRAP, Odoo Community Association (OCA)',
    'website': 'https://github.com/OCA/pos',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'data/barcode_rule.xml',
        'views/assets.xml',
        'views/view_pos_config.xml',
    ],
    'demo': [
        'demo/product_product.xml',
    ],
    'installable': True,
}
