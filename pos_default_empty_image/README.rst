.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

================================================
Optimize loading time for products without image
================================================

This module extends the functionality of point of sale to make PoS load faster
and to improve products display.

Point Of Sale Load faster
=========================

In the point of sale, loading products without image spend unnecessary time
and resources.

When you have 8000 products in your Point of Sale and most of them 
don't have images, removing thousands of useless requests is welcome:
the PoS loads faster that way.


Improve products display
========================

By default, Odoo PoS display a useless generic image for products that doesn't
have images.

  .. figure:: /pos_default_empty_image/static/description/pos_display_default.png
     :width: 800 px

With this module, the display of the product is changed, (Size of the name
is increased for better visibility);

  .. figure:: /pos_default_empty_image/static/description/pos_display_improved.png
     :width: 800 px

Technical information
=====================

Each time the PoS instantiate a product, it will add this code for each product

.. code:: html

    <img src="'/web/binary/image?model=product.product&field=image_medium&id='+product.id;" />

The browser will trigger as many requests than there are different urls.

If you have many products, the browser will soon reach his limit of 
network connections to Odoo server and will wait for free slots instead of 
loading other valuable contents. Then the PoS is then very slow to work with.

This module adds a field has_image in product.product model.

If product has no image, the product image url is not sent to the PoS

Updates
=======

* Feb 2016 : First version
* March 2018 : migration to v10 and improvements for Display

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.


Credits
=======

Contributors
------------

* Hparfr <https://github.com/hparfr> `Akretion <https://akretion.com>`_
* Sylvain LE GAL <https://twitter.com/legalsylvain>
* Invitu <https://github.com/invitu>


Maintainer
----------

.. image:: https://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: https://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose
mission is to support the collaborative development of Odoo features and
promote its widespread use.

To contribute to this module, please visit https://odoo-community.org.
