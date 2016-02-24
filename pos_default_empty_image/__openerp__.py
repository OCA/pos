# -*- coding: utf-8 -*-
# © <2015> <Akretion, OCA>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': 'POS Default empty image',
    'version': '8.0.0.1.0',
    'category': 'Point Of Sale',
    'summary': 'Optimise load time for products with no image',
    'description': """
POS Default empty Image
=======================

In the point of sale, trying to load known inexistant images is a waste of time.


When you have 8000 products in your Point of Sale and most of them don't have images, 
you are happy to save thousands of useless requests : the POS load way faster.

Technical information
=====================

Each time the pos instantiate a product, it will add an
<img src="/web/.... + imageId"> to DOM.
The browser will trigger as many requests than there is different url.
If you have many products, the browser will soon reach his limit of network connections to Odoo server and
will wait for free slots instead of loading other valuable contents. 
The POS is then very slow to work with.


This module adds a field _has_image_ in product.template and will change 
the product image url to his default placeholder directly in the POS.
Because there is only one url for this placeholder, you will have only one request for all the products with
no images.

Indeed, if the product has an image, it will load normally.

    """,
    'author': "Akretion / Odoo Community Association (OCA)",
    'website': "https://akretion.com",
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'data': [ 'view/view.xml'],
    'qweb': [],
}
