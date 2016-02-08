.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

==================================
Require customer for Point of Sale
==================================

This module was written to extend the functionality of odoo pos
and allows you to require a customer for each pos order.  In the
pos session configuration, you can choose to require the customer for pos
orders.

If a customer is not selected, the pos ui will display an error message.
In the backend the customer field is required when needed.


Installation
============

This module depends on the `point_of_sale` Odoo official module.

Configuration
=============

To configure this module, you need to:

* go to point of sale -> configuration -> point of sales
* select the point of sales you want configure
* If you want to require the partner for orders in this pos, select the
  checkbox

Usage
=====

If a customer is not selected, the pos ui will display an error message.
In the backend the customer field is required when needed.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/8.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues <https://github.com/OCA/pos/issues>`_.
In case of trouble, please check there if your issue has already been reported.
If you spotted it first, help us smashing it by providing a detailed and welcomed feedback
`here <https://github.com/OCA/
pos/issues/new?body=module:%20
pos_customer_required%0Aversion:%20
8.0%0A%0A**Steps%20to%20reproduce**%0A-%20...%0A%0A**Current%20behavior**%0A%0A**Expected%20behavior**>`_.


Credits
=======

Contributors
------------

* Jos De Graeve <Jos.DeGraeve@apertoso.be>
* Pedro M. Baeza  <pedro.baeza@gmail.com> ( reviews & feedback )
* Sylvain LE GAL - https://github.com/legalsylvain  ( reviews & feedback )

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
