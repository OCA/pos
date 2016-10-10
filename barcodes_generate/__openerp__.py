# -*- coding: utf-8 -*-
# Copyright (C) 2016-Today GRAP (http://www.grap.coop)
# Copyright (C) 2016-Today GRAP (http://www.lalouve.net)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Generate Barcodes',
    'summary': 'Generate Barcodes for Products and Partners',
    'version': '1.0',
    'category': 'Point Of Sale',
    'author':
        'GRAP,'
        'La Louve,'
        'Odoo Community Association (OCA)',
    'website': 'http://www.odoo-community.org',
    'license': 'AGPL-3',
    'depends': [
        'barcodes',
        'point_of_sale',
    ],
    'data': [
        'security/res_groups.xml',
        'views/view_res_partner.xml',
        'views/view_product_product.xml',
        'views/view_barcode_rule.xml',
    ],
    'demo': [
        'demo/res_users.xml',
        'demo/barcode_rule.xml',
    ],
    'images': [
        'static/description/barcode_rule.png'
    ],
}
