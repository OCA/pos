# -*- coding: utf-8 -*-
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'POS Fix Tax Included',
    'version': '8.0.0.0.1',
    'category': 'Point Of Sale',
    'sequence': 1,
    'author': "Digital5 S.L., "
              "Odoo Community Association (OCA)",
    'summary': 'Prices',
    'depends': [
        "pos_pricelist",
    ],
    'data': [
        'views/pos_fix_tax_included.xml',
    ],
    'demo': [
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ],
    'installable': True,
    'license': 'AGPL-3',
}
