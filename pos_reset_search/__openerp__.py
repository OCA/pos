# -*- coding: utf-8 -*-
{
    'name': "pos_reset_search",

    'summary': """
        Reset search after click on product.""",

    'description': """
        The POS search workflow is to type-in the product name until there is only one
        product left to be selected. Then the user will select the product by typing on 
        the "enter" key. To select a clears the search. This workflow is very efficient 
        but it requires training.
    
        This add-on complete the POS search workflow for beginners. This add-on enables
        users to search and narrow down the product selection to a handful of products.
        The user can then use the mouse and click on the product to select. To click on 
        product clears search. The default workflow is still usable for trained users. 
        
        This new workflow is deemed less efficient but has proven to help beginners.""",

    'author': 'Cooperative le Nid',
    'website': "http://www.lenid.ch",
    'license': 'AGPL-3',
    'category': 'Point of Sale',
    'version': '0.1',
    'depends': ['point_of_sale'],
    'data': [
        'views/templates.xml',
    ],
}
