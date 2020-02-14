# -*- coding: utf-8 -*-
# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Tare barecode labels for loose goods",
    'version': '9.0.0.0.1',
    'category': 'Point of Sale',
    'summary': """Point of Sale - Print and scan tare \
                  barecodes labels to sell loose goods.""",
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/pos",
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'demo': ['demo/pos_barcode_tare_demo.xml'],
    'data': [
        'pos_barcode_tare.xml',
        'views/pos_config_view.xml',
        'data/barcode_rule.xml',
    ],
    'qweb': [
        'static/src/xml/pos_barcode_tare.xml',
    ],
    'installable': True,
}
