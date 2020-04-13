POS Payment Terminal
====================

This module adds support for automatic cashdrawers in the Point of Sale.


Installation
============

This module is designed to be installed on the
*main Odoo server*. On the *POSbox*, you should install the module
*hw_x* depending on the protocol implemented in your device.
`Cashlogy <http://www.cashlogy.com>` are implemented in the
*hw_cashlogy* module and also in pywebdriver <https://github.com/akretion/pywebdriver>.

Configuration
=============

The cashlogyConnector adddress and port should be configured on the main Odoo server,
in the menu *Pointof Sale > Configuration > Payment Methods*,under the *Point of Sale* tab.

Usage
=====

In the frontend of the POS, when you select a payment method CASH you will have a *Start Transaction* button :
if you click on that button, the amount will be sent to the POSbox.

Credits
=======

Contributors
------------

* Aurelien Dumaine
* Mathieu Vatel
* Druidoo <https://www.druidoo.io>

