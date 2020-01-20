# -*- coding: utf-8 -*-
{
    'name': "pos_accented_search",

    'summary': """
        Better product search in POS. Accented characters like é are normalized.""",

    'description': """
        This add-on make pos product search insensitive to accented characters in the product
        name. For instance, café will match both cafe and café.  
    """,

    'author': "Le Nid",
    'website': "http://www.lenid.ch",
    'license': 'AGPL-3',
    'category': 'Point of Sale',
    'version': '0.1',
    'depends': ['point_of_sale'],
    'data': [
        'views/templates.xml',
    ],
}
