=======================
PoS Order To Purchase Order
=======================

This module extends the functionality of point of sale to allow purchase orders
creation from the Point of Sale.

In the POS UI, button has been added to create a purchase order and discard
the current POS order.

This module is usefull in many cases, for exemple :

* take orders with a very simple interface

* if you have some customers that come every day in your shop, but want to
  have a unique invoice at the end of the month. With that module, you can
  create a purchase order and deliver products every time to keep your stock value
  correct, and to create a unique invoice, when you want.

**Technical Notes**

* Some hooks are defined in the JS file, to define custom behaviour after
  having created the purchase order.

* Some prepare functions are available in the ``purchase.order`` model and
  ``purchase.order.line`` models to overload the creation of the purchase order.

**Table of contents**

.. contents::
   :local:

Configuration
=============

* Go to Point Of Sale / Configuration / Point of Sale
* Check the box 'Create Purchase Orders'
* Select the desired default behaviour

Usage
=====

* Open your Point of sale
* create a new order and select products
* select a customer

* then, click on the "Create Purchase Order" button

Three options are available:

* **Create a draft Order**
  A new purchase order in a draft mode will be created that can be changed later.

* **Create a Confirmed Order**
  A new purchase order will be created and confirmed.

* **Create Delivered Picking** (by default)
  A new purchase order will be created and confirmed. the associated picking
  will be marked as delivered.

Credits
=======

Authors
~~~~~~~

* GRAP

Contributors
~~~~~~~~~~~~

* Sylvain LE GAL (https://www.twitter.com/legalsylvain)
* Esteban Monge (https://www.sempai.space)
