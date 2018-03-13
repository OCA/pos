.. image:: https://img.shields.io/badge/license-AGPL--3-blue.png
   :target: https://www.gnu.org/licenses/agpl
   :alt: License: AGPL-3

=================
POS Lot Selection
=================

This module allows to pick between existing lots in POS frontend.

Configuration
=============

1. Go to *Inventory > Settings* and set the option *Track lots or serial
   numbers*
2. Chose a product that is stockable, go to its *Inventory*
   tab, and set *Tracking* to *By Lots*.
3. Go to its *Sales* tab and set it as *Available in the Point of Sale*.
4. Click on *Update Qty On Hand*, chose the same location configured in the
   POS you want the lot available in; write a quantity; unfold the *Lot/Serial
   Number* field and pick create one if none is available yet.
5. Create a new lot with the serial number of your choice.

Usage
=====

* Open a POS Session.
* Choose a product with required lot.
* There is a new select field with the lots available for that product.
* If lot quantity can't cover the order line demand it won't be available to
  pick.
* If there were many lots to fill the value of one of them can be propagated to
  the rest with the new clone control on the right of the lot field.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/10.0

Known issues / Roadmap
======================

* Lot selection is only available when the POS is online. In offline mode the
  select isn't loaded and the lot has to be manually set.

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smash it by providing detailed and welcomed feedback.

Credits
=======

Images
------

* Odoo Community Association: `Icon <https://odoo-community.org/logo.png>`_.

Contributors
------------

* David <david.vidal@tecnativa.com>
  * (https://www.tecnativa.com)

Do not contact contributors directly about support or help with technical issues.

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
