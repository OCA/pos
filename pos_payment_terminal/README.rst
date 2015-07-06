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

This module requires an up-to-date version of Odoo v8 that includes
`this pull request <https://github.com/odoo/odoo/pull/7367>` which was
merged in the *8.0* branch of Odoo on Github on July 2nd 2015.

Configuration
=============

This module support two payment modes : *card* and *check*. The payment
mode should be configured on the main Odoo server, in the menu *Point
of Sale > Configuration > Payment Methods*, under the *Point of Sale* tab.

Usage
=====

In the frontend of the POS, when you select a payment method that has a payment mode *card* or *check*, you will have a *Start Transaction* button : if you click on that button, the amount, the currency and the payment mode will be sent to the POSbox.

Credits
=======

Contributors
------------

* Aurelien Dumaine
* Alexis de Lattre <alexis.delattre@akretion.com>

Maintainer
----------

.. image:: http://odoo-community.org/logo.png
   :alt: Odoo Community Association
   :target: http://odoo-community.org

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
