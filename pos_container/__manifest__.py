# Copyright 2019 Coop IT Easy SCRLfs
# 	    Robin Keunen <robin@coopiteasy.be>
#           Pierrick Brun <pierrick.brun@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).{
{
    'name': "POS Container",
    'version': '12.0.1.0.0',

    'summary': """
        Allows managing pre-weighted containers for bulk shop""",

    "author": "Coop IT Easy SCRLfs, "
              "Odoo Community Association (OCA)",
    'license': "AGPL-3",
    'website': "https://github.com/OCA/pos/",

    'category': 'Point of Sale',

    'depends': ['point_of_sale'],

    'data': [
        'data/product.xml',
        'views/container.xml',
        'templates/templates.xml',
        'security/ir.model.access.csv',
    ],
    'demo': [
        'demo/demo.xml',
    ],

    'qweb': [
        'static/src/xml/pos.xml',
    ],

    'installable': True,
}
