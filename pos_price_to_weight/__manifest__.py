# -*- coding: utf-8 -*-
# Copyright (C) 2017-Today: La Louve (<http://www.lalouve.net/>)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Point of Sale - Price to Weight',
    'version': '10.0.1.0.0',
    'category': 'Point Of Sale',
    'summary': 'Compute weight based on barcodes with prices',
    'author': 'La Louve, GRAP, Odoo Community Association (OCA)',
    'website': 'http://www.lalouve.net/',
    'license': 'AGPL-3',
    'depends': [
        'point_of_sale',
    ],
    'data': [
        'data/barcode_rule.xml',
        'static/src/xml/templates.xml',
    ],
    'demo': [
        'demo/product_product.xml',
    ],
    'installable': True,
}
