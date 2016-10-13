.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

======================================================
Point of Sale - Extra Access Right for Certain Actions
======================================================

This module extends Odoo Point Of Sale features, restricting possibility
to cashier to make some actions in the Point of Sale (set discount, change
unit prices, etc...)

this module can be usefull to limit errors and / or fraud.

This module will add the following groups to Odoo:

* PoS - Negative Quantity: The cashier can sell negative quantity in Point Of
  Sale (ie, can return products);

* PoS - Discount: The cashier can set Discount in Point Of Sale;

* PoS - Change Unit Price: The cashier can change the unit price of a product
  in Point Of Sale;

* PoS - Many Orders: The cashier can many orders at the same time;

* PoS - Delete Order: The cashier can not delete a full order;

.. image:: /pos_access_right/static/description/new_groups.png

If a user doesn't belong to a group, he can not use the according feature.

For example, here is the default numpad for the demo data user :

.. image:: /pos_access_right/static/description/demo_numpad.png

If the user try to use a forbidden feature, here is the warning displayed.

.. image:: /pos_access_right/static/description/demo_error.png

If the cashier changed, the new right are applied :

.. image:: /pos_access_right/static/description/admin_numpad.png

Installation
============

Normal installation.

Configuration
=============

Once installed, you have to give correct access right to your cashiers.

Limits / Roadmap
================

The feature are only blocked on the Point of sale Frond End UI. it could be
interesting do the same in the back-end office for some of this blockages.

Usage
=====

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/9.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/{project_repo}/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed `feedback
<https://github.com/OCA/
pos/issues/new?body=module:%20
pos_access_right%0Aversion:%20
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
