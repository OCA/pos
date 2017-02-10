# -*- coding: utf-8 -*-
{
    'name': "List POS Orders",
    'summary': """
    Add option in POS UI to list and print generated orders """,
    'author': "Cristian Salamea",
    'website': "http://www.ayni.com.ec",
    'category': 'Point Of Sale',
    'version': '10.0.0.0.1',
    'depends': ['point_of_sale'],
    'data': [
        'views/views.xml'
    ],
    'qweb': [
        'static/src/xml/pos.xml'
    ]
}
