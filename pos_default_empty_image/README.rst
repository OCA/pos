.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

=======================
POS Default Empty Image
=======================

In the point of sale, trying to load known inexistant images 
is a waste of time.


When you have 8000 products in your Point of Sale and most of them 
don't have images, you are happy to save thousands of useless requests:
the POS load way faster.

Technical information
=====================

Each time the pos instantiate a product, it will add an

    <img src="'/web/binary/image?model=product.product&field=image_medium&id='+product.id;" />

The browser will trigger as many requests than there is different url.


If you have many products, the browser will soon reach his limit of 
network connections to Odoo server and will wait for free slots instead of 
loading other valuable contents. Then the POS is then very slow to work with.


This module adds a field _has_image_ in product.template and will 
change the product image url to his default placeholder directly in the POS.

Because there is only one url for this placeholder, 
you will have only one request for all the products with no images.


Indeed, if the product has an image, it will load normally.


Known issues
============


Updates
=======

* Feb 2016 : First version

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/web/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback `here <https://github.com/OCA/web/issues/new?body=module:%20pos_default_empty_image%0Aversion:%200.1%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Hparfr <https://github.com/hparfr> `Akretion <https://akretion.com>`_
* Sylvain LE GAL <https://twitter.com/legalsylvain>
* Ronald Portier <ronald@therp.nl>

See also this module `pos_improve_images from GRAP 
<https://github.com/grap/odoo-addons-grap/tree/7.0/pos_improve_images>`_ for OpenERP 7.


Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
