# -*- coding: utf-8 -*-
{
    'name': "pos_barecode_tare",

    'summary': """
        Allows to scan a barcode to tare the latest product.
    """,

    'description': """
        This add-on enable POS to read and print tare bar codes. A tare bar code is used to sell unpackaged goods in a
         BYOC (bring your own container) scheme. This scheme has four steps:
         1. The cashier weights the container and sticks the tare bar code onto the customer's container. 
         2. The customer takes the desired quantity of whatever good s-he wants.
         3. The cashier weights the filled container and good, POS gives the corresponding price.
         4. The cashier scans the tare bar code, POS removes the container's weight from the latest product of the order.
    """,

    'author': "Le Nid",
    'website': "http://www.lenid.ch",

    'category': 'Point of Sale',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['point_of_sale'],

    # always loaded
    'data': [
        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/tare_screen.xml',
        'static/src/xml/open_tare_screen_button.xml',

    ],
}
