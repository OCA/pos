.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
    :alt: License: AGPL-3

PoS - Return Order
==================

This module was written to extend the functionality of odoo Point Of Sale about
 Order returns.

With this module, it is now forbidden to return more products than the quantity
of the initial Order.

A link is created between the returned Order and the initial Order.
A link is created between the returned Order Line and the initial Order Line.

Implemented Features
--------------------

* A wizard that allow to select just some products to return:

.. image:: /pos_return_order/static/description/partial_return_wizard.png

Implemented Constraints
-----------------------

* User can not return more products than the initial quantity:

.. image:: /pos_return_order/static/description/returned_qty_over_initial.png

* If a line has been partially refund, only a reduced quantity can be returned:

.. image:: /pos_return_order/static/description/sum_returned_qty_over_initial.png

* It is not possible to set a negative quantity if the initial Pos Order is
  not indicated:

.. image:: /pos_return_order/static/description/initial_pos_order_required.png

Installation
============

Normal installation.

Configuration
=============

In some case, you can want to let the possibility to allow negative quantity
in a PoS Order, without mention initial order. This can be possible for special
products like returnable products, ...

In that case, a checkbox is possible on Product Form View to allow such case

.. image:: /pos_return_order/static/description/product_returnable_bottle.png

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/9.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed `feedback
<https://github.com/OCA/
pos/issues/new?body=module:%20
pos_return_order%0Aversion:%20
9.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://github.com/OCA/maintainer-tools/blob/master/template/module/static/description/icon.svg>`_.

Contributors
------------

* Sylvain LE GAL <https://twitter.com/legalsylvain>

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

