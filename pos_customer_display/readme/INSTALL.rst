This module is designed to be installed on the *main Odoo server*. On the
*POSbox*, you should install the module *hw_customer_display*. But you will certainly prefer to use `pywebdriver <https://github.com/akretion/pywebdriver>`__ instead of the POSbox. Compared to the POSbox, Pywebdriver has several advantages:

* smaller footprint: no need to have a full-blown Odoo with PostgreSQL on the computer of the cashier (or his small Linux-based PC connected to the hardware, like the RaspberryPi for the POSbox),
* availability of an Ubuntu package, for easier deployment,
* native support for the customer display, payment terminal, etc.
* nice test/diagnosis Web interface.
