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

  .. figure:: ../static/description/pos_display_default.png
     :width: 800 px

With this module, the display of the product is changed, (Size of the name
is increased for better visibility);

  .. figure:: ../static/description/pos_display_improved.png
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
