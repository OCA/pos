.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==================
PoS - Return Order
==================

This module extends the functionality of odoo Point Of Sale about POS Order
returns.

With this module, it is now forbidden to return more quantity than the initial
one.

A link is created between the returned Order and the initial Order.
A link is created between the returned Order Line and the initial Order Line.

Implemented Features
====================

* A wizard that allow to select just some products to return:

.. image:: /pos_return_order/static/description/partial_return_wizard.png

Implemented Constraints
=======================

* User can not return more products than the initial quantity:

.. image:: /pos_return_order/static/description/returned_qty_over_initial.png

* If a line has been partially refund, only a reduced quantity can be returned:

.. image:: /pos_return_order/static/description/sum_returned_qty_over_initial.png

* It is not possible to set a negative quantity if the initial Pos Order is
  not indicated:

.. image:: /pos_return_order/static/description/initial_pos_order_required.png

Configuration
=============

In some case, you want to let the possibility to allow negative quantity
in a PoS Order, without mentioning initial order. This can happen for special
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
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Sylvain LE GAL <https://twitter.com/legalsylvain>

Funders
-------

The development of this module has been financially supported by:

* La Louve (www.lalouve.net)
* GRAP, Groupement Régional Alimentaire de Proximité (www.grap.coop)

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
