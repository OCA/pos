This module is designed to be installed on the
*main Odoo server*. On the *POSbox/IoTbox*, you should install the module
*hw_x* depending on the protocol implemented in your device. Remember that the POSbox/IoTbox runs Odoo v12 (even if your Odoo server runs v13 or v14), so you should look in the 12.0 branch of the `OCA POS project <https://github.com/OCA/pos>`_ to find the *hw_x* modules.

`Ingenico <http://en.wikipedia.org/wiki/Ingenico>`
card readers for France support the Telium protocol implemented in the
*hw_telium_payment_terminal* module for the POSbox/IoTBox.

You can also consider `pywebdriver project <https://github.com/akretion/pywebdriver>`_ as an alternative to the POSbox/IoTbox.
