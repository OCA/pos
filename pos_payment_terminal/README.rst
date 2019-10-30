.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

====================
POS Payment Terminal
====================

This module adds support for credit card reader and checks printer
in the Point of Sale.

This module has been developped during a POS code sprint at Akretion
France from July 7th to July 10th 2014. This module is part of the POS
project of the Odoo Community Association http://odoo-community.org/.
You are invited to become a member and/or get involved in the
Association !

Installation
============

This module is designed to be installed on the
*main Odoo server*. On the *POSbox*, you should install the module
*hw_x* depending on the protocol implemented in your device.
`Ingenico <http://en.wikipedia.org/wiki/Ingenico>`
and old Sagem devices support the Telium protocol implemented in the
*hw_telium_payment_terminal* module.

Configuration
=============

This module support two payment modes : *card* and *check*. The payment
mode should be configured on the main Odoo server, in the menu *Point
of Sale > Configuration > Payment Methods*, under the *Point of Sale* tab.

Usage
=====

In the frontend of the POS, when you select a payment method that has a payment mode *card* or *check*, you will have a *Start Transaction* button : if you click on that button, the amount, the currency and the payment mode will be sent to the POSbox.

.. image:: https://odoo-community.org/website/image/ir.attachment/5784_f2813bd/datas
   :alt: Try me on Runbot
   :target: https://runbot.odoo-community.org/runbot/184/10.0

Bug Tracker
===========

Bugs are tracked on `GitHub Issues
<https://github.com/OCA/pos/issues>`_. In case of trouble, please
check there if your issue has already been reported. If you spotted it first,
help us smashing it by providing a detailed and welcomed feedback.

Credits
=======

Contributors
------------

* Aurelien Dumaine
* Alexis de Lattre <alexis.delattre@akretion.com>

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
